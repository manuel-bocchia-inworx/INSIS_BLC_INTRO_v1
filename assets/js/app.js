/* ============================================================
   Capacitación BLC — Lógica de navegación, progreso y examen
   Sin dependencias externas. Estado en localStorage.
   ============================================================ */

(function () {
  "use strict";

  var STORE_KEY = "blc-training-progress-v1";
  var PASS_MARK = 0.7;

  var sections = [];
  var state = { done: [], quiz: null };

  /* ---------- Estado ---------- */

  function loadState() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        state.done = Array.isArray(parsed.done) ? parsed.done : [];
        state.quiz = parsed.quiz || null;
      }
    } catch (e) {
      state = { done: [], quiz: null };
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (e) {
      /* Modo privado o almacenamiento lleno: el curso sigue usable sin persistencia. */
    }
  }

  function isDone(id) { return state.done.indexOf(id) !== -1; }

  function toggleDone(id, on) {
    var i = state.done.indexOf(id);
    if (on && i === -1) state.done.push(id);
    if (!on && i !== -1) state.done.splice(i, 1);
    saveState();
  }

  /* ---------- Navegación ---------- */

  function buildNav() {
    var nav = document.getElementById("nav");
    sections = Array.prototype.slice.call(document.querySelectorAll("section.section[id]"));

    sections.forEach(function (sec) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + sec.id;
      a.dataset.target = sec.id;
      a.innerHTML = '<span class="dot" aria-hidden="true"></span><span>' +
        (sec.dataset.navLabel || sec.getAttribute("aria-label") || sec.id) + "</span>";
      li.appendChild(a);
      nav.appendChild(li);
    });
  }

  function buildMarkButtons() {
    sections.forEach(function (sec) {
      if (sec.dataset.noMark === "true") return;

      var footer = document.createElement("div");
      footer.className = "section-footer";

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mark-btn";
      btn.setAttribute("aria-pressed", "false");
      btn.dataset.section = sec.id;
      btn.innerHTML = '<span class="tick"></span><span class="mark-label">Marcar como completado</span>';

      var hint = document.createElement("span");
      hint.className = "hint";
      hint.textContent = "Tu avance se guarda en este navegador.";

      footer.appendChild(btn);
      footer.appendChild(hint);
      sec.appendChild(footer);

      btn.addEventListener("click", function () {
        var next = btn.getAttribute("aria-pressed") !== "true";
        toggleDone(sec.id, next);
        paintSection(sec.id);
        updateProgress();
      });
    });
  }

  function paintSection(id) {
    var btn = document.querySelector('.mark-btn[data-section="' + id + '"]');
    var link = document.querySelector('.nav a[data-target="' + id + '"]');
    var done = isDone(id);

    if (btn) {
      btn.setAttribute("aria-pressed", done ? "true" : "false");
      btn.querySelector(".mark-label").textContent = done ? "Completado" : "Marcar como completado";
    }
    if (link) link.classList.toggle("done", done);
  }

  function markableIds() {
    return sections
      .filter(function (s) { return s.dataset.noMark !== "true"; })
      .map(function (s) { return s.id; });
  }

  function updateProgress() {
    var ids = markableIds();
    var total = ids.length;
    var done = ids.filter(isDone).length;
    var pct = total ? Math.round((done / total) * 100) : 0;

    ["progressFill", "progressFillTop"].forEach(function (elId) {
      var el = document.getElementById(elId);
      if (el) el.style.width = pct + "%";
    });
    ["progressPct", "progressPctTop"].forEach(function (elId) {
      var el = document.getElementById(elId);
      if (el) el.textContent = pct + "%";
    });

    var count = document.getElementById("progressCount");
    if (count) count.textContent = done + " de " + total + " secciones";

    var bar = document.getElementById("progressBar");
    if (bar) bar.setAttribute("aria-valuenow", String(pct));
  }

  function setupScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".nav a"));
    if (!("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (l) {
          l.classList.toggle("active", l.dataset.target === entry.target.id);
        });
      });
    }, { rootMargin: "-15% 0px -70% 0px", threshold: 0 });

    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ---------- Menú móvil ---------- */

  function setupMobileMenu() {
    var sidebar = document.getElementById("sidebar");
    var backdrop = document.getElementById("backdrop");
    var toggle = document.getElementById("menuToggle");
    if (!sidebar || !toggle) return;

    function close() {
      sidebar.classList.remove("open");
      backdrop.classList.remove("show");
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", function () {
      var open = sidebar.classList.toggle("open");
      backdrop.classList.toggle("show", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    backdrop.addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    sidebar.addEventListener("click", function (e) {
      if (e.target.closest("a") && window.innerWidth <= 980) close();
    });
  }

  /* ---------- Glosario ---------- */

  function renderGlossary() {
    var host = document.getElementById("glossary");
    if (!host || typeof GLOSSARY === "undefined") return;

    GLOSSARY.forEach(function (item) {
      var wrap = document.createElement("div");
      wrap.className = "term";
      wrap.innerHTML =
        "<dt>" + item.t + "</dt>" +
        "<dd>" + item.d + '<span class="cite"><b>Fuente:</b> Modelo de datos BLC, ' + item.s + "</span></dd>";
      host.appendChild(wrap);
    });
  }

  /* ---------- Examen ---------- */

  function renderQuiz() {
    var host = document.getElementById("quizList");
    if (!host || typeof QUIZ === "undefined") return;

    QUIZ.forEach(function (item, qi) {
      var card = document.createElement("article");
      card.className = "question";
      card.dataset.index = String(qi);

      var head = '<div class="q-head"><span class="q-num">' + (qi + 1) + "/" + QUIZ.length +
        '</span><p class="q-text">' + item.q + "</p></div>" +
        '<span class="q-topic">Tema: ' + item.topic + "</span>";

      var opts = '<div class="options" role="radiogroup" aria-label="Pregunta ' + (qi + 1) + '">';
      item.options.forEach(function (opt, oi) {
        opts += '<label class="option" data-opt="' + oi + '">' +
          '<input type="radio" name="q' + qi + '" value="' + oi + '">' +
          "<span>" + opt + "</span></label>";
      });
      opts += "</div>";

      var fb = '<div class="feedback" id="fb-' + qi + '"></div>';

      card.innerHTML = head + opts + fb;
      host.appendChild(card);
    });

    host.addEventListener("change", function (e) {
      if (e.target && e.target.type === "radio") {
        var card = e.target.closest(".question");
        if (card) card.classList.remove("answered-ok", "answered-bad");
        var result = document.getElementById("quizResult");
        if (result) result.classList.remove("show", "pass", "fail");
      }
    });

    document.getElementById("quizSubmit").addEventListener("click", gradeQuiz);
    document.getElementById("quizReset").addEventListener("click", resetQuiz);

    var totalEl = document.getElementById("quizTotal");
    if (totalEl) totalEl.textContent = String(QUIZ.length);
    var passEl = document.getElementById("quizPassCount");
    if (passEl) passEl.textContent = String(Math.ceil(QUIZ.length * PASS_MARK));
  }

  function gradeQuiz() {
    var correct = 0;
    var unanswered = 0;

    QUIZ.forEach(function (item, qi) {
      var card = document.querySelector('.question[data-index="' + qi + '"]');
      var chosen = document.querySelector('input[name="q' + qi + '"]:checked');
      var fb = document.getElementById("fb-" + qi);
      var labels = card.querySelectorAll(".option");

      labels.forEach(function (l) {
        l.classList.add("locked");
        l.classList.remove("correct", "incorrect");
        var idx = Number(l.dataset.opt);
        if (idx === item.answer) l.classList.add("correct");
      });

      if (!chosen) {
        unanswered++;
        card.classList.remove("answered-ok");
        card.classList.add("answered-bad");
        fb.className = "feedback bad show";
        fb.innerHTML = "Sin responder. La opción correcta está resaltada. " + item.why +
          '<span class="src">Fuente: ' + item.src + "</span>";
        return;
      }

      var value = Number(chosen.value);
      var ok = value === item.answer;
      if (ok) correct++;
      else card.querySelector('.option[data-opt="' + value + '"]').classList.add("incorrect");

      card.classList.toggle("answered-ok", ok);
      card.classList.toggle("answered-bad", !ok);
      fb.className = "feedback " + (ok ? "ok" : "bad") + " show";
      fb.innerHTML = (ok ? "Correcto. " : "Incorrecto. ") + item.why +
        '<span class="src">Fuente: ' + item.src + "</span>";
    });

    var pct = Math.round((correct / QUIZ.length) * 100);
    var passed = correct / QUIZ.length >= PASS_MARK;

    state.quiz = { correct: correct, total: QUIZ.length, pct: pct, passed: passed, at: new Date().toISOString() };
    saveState();

    var result = document.getElementById("quizResult");
    result.className = "result show " + (passed ? "pass" : "fail");
    result.innerHTML =
      '<div class="score">' + pct + "%</div>" +
      "<h3>" + (passed ? "Aprobado" : "Aún no alcanza el mínimo") + "</h3>" +
      "<p>Respondiste correctamente <b>" + correct + "</b> de <b>" + QUIZ.length + "</b> preguntas." +
      (unanswered ? " Quedaron " + unanswered + " sin responder." : "") +
      " El mínimo para aprobar es " + Math.round(PASS_MARK * 100) + "%.</p>" +
      "<p>" + (passed
        ? "Revisá igualmente la retroalimentación de cada pregunta: cada explicación cita la tabla y la página del modelo de datos."
        : "Repasá las secciones vinculadas a las preguntas falladas y volvé a intentarlo. Cada respuesta indica la fuente exacta.") + "</p>";

    result.scrollIntoView({ behavior: "smooth", block: "center" });
    renderQuizBadge();
  }

  function resetQuiz() {
    QUIZ.forEach(function (item, qi) {
      var card = document.querySelector('.question[data-index="' + qi + '"]');
      card.classList.remove("answered-ok", "answered-bad");
      card.querySelectorAll(".option").forEach(function (l) {
        l.classList.remove("locked", "correct", "incorrect");
      });
      card.querySelectorAll('input[type="radio"]').forEach(function (r) { r.checked = false; });
      var fb = document.getElementById("fb-" + qi);
      fb.className = "feedback";
      fb.innerHTML = "";
    });

    state.quiz = null;
    saveState();
    document.getElementById("quizResult").className = "result";
    renderQuizBadge();
    document.getElementById("examen").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderQuizBadge() {
    var el = document.getElementById("quizBadge");
    if (!el) return;
    if (!state.quiz) {
      el.textContent = "Examen pendiente";
      el.className = "progress-note";
      return;
    }
    el.textContent = "Último intento: " + state.quiz.pct + "% (" +
      (state.quiz.passed ? "aprobado" : "no aprobado") + ")";
  }

  /* ---------- Reinicio ---------- */

  function setupReset() {
    var btn = document.getElementById("resetAll");
    if (!btn) return;
    btn.addEventListener("click", function () {
      if (!window.confirm("Esto borra tu avance y el resultado del examen en este navegador. ¿Continuar?")) return;
      state = { done: [], quiz: null };
      saveState();
      sections.forEach(function (s) { paintSection(s.id); });
      updateProgress();
      if (typeof QUIZ !== "undefined") resetQuiz();
      renderQuizBadge();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Init ---------- */

  document.addEventListener("DOMContentLoaded", function () {
    loadState();
    buildNav();
    buildMarkButtons();
    renderGlossary();
    renderQuiz();
    sections.forEach(function (s) { paintSection(s.id); });
    updateProgress();
    renderQuizBadge();
    setupScrollSpy();
    setupMobileMenu();
    setupReset();

    var year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
  });
})();
