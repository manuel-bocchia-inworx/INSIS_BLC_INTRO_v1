/* ============================================================
   Capacitación BLC — Banco de datos del curso
   Fuentes: BLC_reconstruccion_capacitacion.md,
            Billing_and_Collection_Data_Model.pdf (250 pág.),
            transcription.txt, agent-bundle INSIS Oracle Agent.
   ============================================================ */

/* Examen final. `answer` es el índice de la opción correcta. */
const QUIZ = [
  {
    topic: "Modelo mental",
    q: "¿Qué representa principalmente <code>BLC_INSTALLMENTS</code>?",
    options: [
      "El asiento contable final enviado al ERP.",
      "El importe que debe cobrarse o pagarse dentro de un item, en una fecha determinada.",
      "El extracto bancario recibido del banco.",
      "La configuración de un catálogo o lookup."
    ],
    answer: 1,
    why: "Un installment es un importe a cobrar o pagar en una fecha, asociado a un item y/o cuenta. Es el mayor nivel de detalle financiero del módulo.",
    src: "Modelo BLC, BLC_INSTALLMENTS (pág. 83-91) · Curso §4.3"
  },
  {
    topic: "Trazabilidad",
    q: "¿Cómo se encuentra el payment que se aplicó a una transaction?",
    options: [
      "Leyendo <code>BLC_DOCUMENTS.STATUS</code>.",
      "Por <code>BLC_APPLICATIONS.TARGET_TRX</code> y luego <code>SOURCE_PAYMENT</code>.",
      "Por <code>BLC_ITEMS.ITEM_NAME</code>.",
      "Por <code>BLC_LOOKUPS.TAG_0</code>."
    ],
    answer: 1,
    why: "La aplicación es el puente entre dinero y obligación: TARGET_TRX apunta a la transaction y SOURCE_PAYMENT al pago que la originó.",
    src: "Modelo BLC, BLC_APPLICATIONS (pág. 16-23) · Curso §5 parte 6"
  },
  {
    topic: "Clases de installment",
    q: "¿Qué significa normalmente la clase <code>R</code> de installment?",
    options: [
      "Refund ya ejecutado.",
      "Revenue recognition only: reconocimiento de ingreso que nunca se factura.",
      "Reinsurance payable.",
      "Reversal bancaria."
    ],
    answer: 1,
    why: "La clase R es reconocimiento de ingreso con finalidad contable. No genera obligación de cobro operativa, a diferencia de la clase B.",
    src: "Modelo BLC, BLC_INSTALLMENTS.INSTALLMENT_CLASS (pág. 88) · Curso §4.4"
  },
  {
    topic: "Saldos",
    q: "¿Qué indica un <code>OPEN_BALANCE</code> negativo en una transaction?",
    options: [
      "Que el registro es inválido y debe corregirse.",
      "Que existe un crédito, reversa o importe potencialmente reintegrable.",
      "Que el pago ya está cleared por el banco.",
      "Que el documento fue borrado."
    ],
    answer: 1,
    why: "Un saldo negativo representa un crédito a favor de la contraparte. No implica que la devolución ya se haya ejecutado: eso requiere un payment outgoing o una aplicación a actividad REFUND.",
    src: "Modelo BLC, BLC_TRANSACTIONS.OPEN_BALANCE (pág. 243) · Curso §6.1"
  },
  {
    topic: "Clases de installment",
    q: "Un siniestro confirmado para pago genera installments de clase…",
    options: [
      "<code>B</code>, porque toda obligación se factura.",
      "<code>P</code>, porque es un importe a pagar.",
      "<code>R</code>, porque se reconoce como ingreso.",
      "<code>D</code>, porque se solicita como depósito."
    ],
    answer: 1,
    why: "La clase P (Pay) corresponde a importes que la compañía debe pagar: siniestros, comisiones y otros egresos.",
    src: "Modelo BLC, BLC_INSTALLMENTS (pág. 83, 88) · Curso §4.4 y §7.3"
  },
  {
    topic: "Items",
    q: "Una misma póliza con agente y con un siniestro pagado genera en BLC…",
    options: [
      "Un único item que concentra prima, comisión y siniestro.",
      "Items distintos: policy para primas, commission para el agente y claim para el siniestro.",
      "Un item por cada cuota del plan de pagos.",
      "Ningún item: solo transactions."
    ],
    answer: 1,
    why: "Cada motivo financiero tiene su propio item. Por eso no alcanza con filtrar por número de póliza: hay que seguir el ITEM_ID y su tipo.",
    src: "Modelo BLC, BLC_ITEMS.ITEM_TYPE (pág. 92, 96) · Curso §5 parte 2"
  },
  {
    topic: "Identidad del item",
    q: "¿Qué cuatro atributos identifican funcionalmente a un billing item?",
    options: [
      "POLICY, ANNEX, CLAIM y AGENT.",
      "SOURCE, AGREEMENT, COMPONENT y DETAIL.",
      "ITEM_ID, ACCOUNT_ID, DOC_ID y TRANSACTION_ID.",
      "CURRENCY, AMOUNT, RATE y RATE_DATE."
    ],
    answer: 1,
    why: "El modelo identifica el item con al menos los dos primeros y hasta cuatro atributos: sistema origen, acuerdo, componente y detalle. La combinación debe ser única.",
    src: "Modelo BLC, BLC_ITEMS (pág. 92) · Curso §4.2"
  },
  {
    topic: "Documentos",
    q: "¿Qué relación permite saber qué transactions integran un documento?",
    options: [
      "<code>BLC_DOCUMENTS.REF_DOC_ID</code>.",
      "<code>BLC_TRANSACTIONS.DOC_ID</code> apuntando a <code>BLC_DOCUMENTS.DOC_ID</code>.",
      "<code>BLC_INSTALLMENTS.ITEM_ID</code>.",
      "<code>BLC_PAYMENTS.USAGE_ID</code>."
    ],
    answer: 1,
    why: "La transaction guarda el DOC_ID del documento que la contiene. Un documento puede agrupar varias transactions, como la reversa y el diferencial de un endoso.",
    src: "Modelo BLC, FK TRX_DOC (pág. 69, 242) · Curso §5 parte 5"
  },
  {
    topic: "Saldos",
    q: "¿Cuál es la diferencia entre <code>OPEN_BALANCE</code> y <code>ACTUAL_OPEN_BALANCE</code>?",
    options: [
      "Son sinónimos; uno está deprecado.",
      "OPEN_BALANCE considera pagos aplicados cleared y no cleared; ACTUAL_OPEN_BALANCE considera solo los cleared.",
      "OPEN_BALANCE está en moneda funcional y ACTUAL_OPEN_BALANCE en moneda original.",
      "ACTUAL_OPEN_BALANCE solo existe en documentos."
    ],
    answer: 1,
    why: "ACTUAL_OPEN_BALANCE refleja el saldo considerando únicamente pagos ya confirmados por el banco, por eso puede diferir del OPEN_BALANCE.",
    src: "Modelo BLC, BLC_TRANSACTIONS (pág. 241, 243) · Curso §5 parte 4"
  },
  {
    topic: "Estados",
    q: "En <code>BLC_TRANSACTIONS</code>, ¿qué significa <code>PAID_STATUS = 'P'</code>?",
    options: [
      "Posted al sistema contable.",
      "Parcialmente pagado.",
      "Pending de aprobación.",
      "Payable class."
    ],
    answer: 1,
    why: "PAID_STATUS usa N (no pagado), P (parcialmente pagado) e Y (pagado). No confundir con TRANSACTION_CLASS = 'P', que significa payable.",
    src: "Modelo BLC, BLC_TRANSACTIONS.PAID_STATUS (pág. 243) · Curso §6.2"
  },
  {
    topic: "Pagos",
    q: "Un payment tiene <code>APPLIED_STATUS = 'P'</code> y <code>OPEN_BALANCE</code> mayor a cero. ¿Qué significa?",
    options: [
      "El pago fue rechazado por el banco.",
      "El pago se aplicó parcialmente y aún tiene importe disponible para aplicar.",
      "El pago está duplicado.",
      "El pago pertenece a otra entidad legal."
    ],
    answer: 1,
    why: "El remanente puede quedar disponible para aplicarse a facturaciones futuras, de forma manual o automática según configuración.",
    src: "Modelo BLC, BLC_PAYMENTS.OPEN_BALANCE / APPLIED_STATUS (pág. 144, 147) · Curso §6.3"
  },
  {
    topic: "Catálogos",
    q: "¿Por qué no alcanza con buscar un código en <code>BLC_LOOKUPS</code> sin filtrar por <code>LOOKUP_SET</code>?",
    options: [
      "Porque la tabla no tiene índice por código.",
      "Porque el mismo código puede existir en distintos conjuntos y significar cosas diferentes.",
      "Porque los códigos están cifrados.",
      "Porque LOOKUP_SET es la clave primaria."
    ],
    answer: 1,
    why: "BLC_LOOKUPS agrupa los valores en conjuntos por significado. El LOOKUP_SET define el dominio del código y sus tags de comportamiento.",
    src: "Modelo BLC, BLC_LOOKUPS (pág. 105-113) · Curso §9.1"
  },
  {
    topic: "Catálogos",
    q: "En el lookup set <code>INSTALLMENT_TYPES</code>, ¿qué información contiene <code>TAG_0</code>?",
    options: [
      "El idioma de la traducción.",
      "La clase de installment asociada al tipo.",
      "El importe máximo permitido.",
      "La ruta de envío del documento."
    ],
    answer: 1,
    why: "El modelo indica que la clase del installment está disponible en el Tag_0 del lookup; otros tags controlan agrupación y campos aplicables.",
    src: "Modelo BLC, BLC_INSTALLMENTS.INSTALLMENT_TYPE (pág. 89) · Curso §9.1"
  },
  {
    topic: "Moneda",
    q: "Una póliza está en USD y el pago se registró en CLP. ¿Qué explica esta situación?",
    options: [
      "Es un error de carga que debe corregirse.",
      "La obligación se conserva en su moneda original y el pago se registra en moneda local, aplicándose con tasas de cambio.",
      "BLC no admite operaciones multimoneda.",
      "El payment pertenece a otra póliza."
    ],
    answer: 1,
    why: "BLC mantiene moneda original y moneda funcional. La aplicación guarda importes y tasas de ambos lados, además de las diferencias por redondeo.",
    src: "Modelo BLC, BLC_TRANSACTIONS.FC_AMOUNT y BLC_APPLICATIONS.SOURCE/TARGET_RATE (pág. 238, 17) · Curso §8"
  },
  {
    topic: "Aplicaciones",
    q: "¿Qué clase de aplicación corresponde a asignar un cobro a la cuenta de una parte, sin imputarlo todavía a una transaction?",
    options: [
      "<code>PMNT_ON_TRANSACTION</code>.",
      "<code>RCPT_ON_ACCOUNT</code>.",
      "<code>CREDIT_ON_TRANSACTION</code>.",
      "<code>TRX_ON_ACTIVITY</code>."
    ],
    answer: 1,
    why: "RCPT_ON_ACCOUNT aplica un cobro entrante sobre la cuenta de la parte, aumentando su saldo a favor sin cerrar una transaction específica.",
    src: "Modelo BLC, BLC_APPLICATIONS.APPL_CLASS (pág. 19) · Curso §5 parte 6"
  },
  {
    topic: "Aplicaciones",
    q: "¿Cómo se representa la reversión de una aplicación?",
    options: [
      "Borrando el registro original.",
      "Con un registro idéntico de signo opuesto que referencia al original mediante <code>REVERSED_APPL</code>.",
      "Cambiando el STATUS a 'X'.",
      "Creando un documento de tipo nota."
    ],
    answer: 1,
    why: "Las reversiones no borran historia: se registran como aplicaciones espejo con importes de signo contrario y referencia a la aplicación revertida.",
    src: "Modelo BLC, BLC_APPLICATIONS.REVERSED_APPL (pág. 21) · Curso §5 parte 6"
  },
  {
    topic: "Clearing",
    q: "¿Qué registra <code>BLC_CLEARINGS</code>?",
    options: [
      "La aprobación interna del documento.",
      "La confirmación bancaria del movimiento de un payment.",
      "El cálculo de la prima.",
      "El catálogo de métodos de pago."
    ],
    answer: 1,
    why: "El clearing representa la instancia bancaria. Un payment puede estar registrado y aplicado antes de ser confirmado por el banco, según configuración.",
    src: "Modelo BLC, BLC_CLEARINGS (pág. 53-56) · Curso §11.1"
  },
  {
    topic: "Mora",
    q: "En <code>BLC_OVERDUE_EVENTS</code>, ¿qué representa el estado <code>W</code>?",
    options: [
      "Warning enviado al cliente.",
      "Waiting: el evento espera que se cumpla un prerrequisito o dependencia.",
      "Written-off: deuda dada de baja.",
      "Workflow finalizado."
    ],
    answer: 1,
    why: "El evento queda en Waiting cuando depende de la ejecución de otro evento o del envío/entrega de una notificación.",
    src: "Modelo BLC, BLC_OVERDUE_EVENTS.STATUS (pág. 129) · Curso §10.2"
  },
  {
    topic: "Remittances",
    q: "Un bróker transfiere un único importe que corresponde a varias pólizas. ¿Cómo lo resuelve BLC?",
    options: [
      "Crea un payment por póliza automáticamente.",
      "Registra un payment y lo distribuye mediante remittances y múltiples applications.",
      "Rechaza el pago por ambigüedad.",
      "Lo aplica siempre a la póliza más antigua."
    ],
    answer: 1,
    why: "La remittance advice indica cómo distribuir un pago masivo; el payment es uno solo y las applications lo reparten entre transactions.",
    src: "Modelo BLC, BLC_REMITTANCES (pág. 186-191) · Curso §11.3"
  },
  {
    topic: "Impuestos",
    q: "¿Qué tipo de impuesto de <code>BLC_TAXES</code> se calcula como porcentaje negativo para compensar otro impuesto?",
    options: [
      "Sales.",
      "Offset.",
      "Charge.",
      "Withholding."
    ],
    answer: 1,
    why: "Los offset taxes se calculan como porcentaje negativo sobre el impuesto base, generando una transacción de signo opuesto.",
    src: "Modelo BLC, BLC_TAXES.TAX_TYPE (pág. 228, 231) · Curso §13"
  },
  {
    topic: "Contabilidad",
    q: "¿Cuál es la secuencia correcta hacia la contabilidad?",
    options: [
      "GL → SLA events → transactions.",
      "Objetos financieros → <code>BLC_SLA_EVENTS</code> → <code>BLC_SLA_EVENT_STATUS</code> → <code>BLC_GL_INSIS2GL</code>.",
      "Documents → payments → lookups.",
      "Installments → batches → clearing."
    ],
    answer: 1,
    why: "Los hechos financieros generan eventos SLA, cuyo estado se controla por ledger antes de producir las líneas contables en BLC_GL_INSIS2GL.",
    src: "Modelo BLC, BLC_SLA_EVENTS / BLC_GL_INSIS2GL (pág. 215, 220, 70) · Curso §14"
  },
  {
    topic: "Contabilidad",
    q: "En <code>BLC_SLA_EVENT_STATUS</code>, un evento con estado <code>E</code> indica que…",
    options: [
      "Fue ejecutado con éxito.",
      "Se produjo un error durante el procesamiento contable, por ejemplo por falta de regla.",
      "Está exento de contabilización.",
      "Fue enviado al banco."
    ],
    answer: 1,
    why: "Los estados son U (unprocessed), E (error), P (pending) y A (accounted). El código de error queda registrado en el propio registro.",
    src: "Modelo BLC, BLC_SLA_EVENT_STATUS (pág. 220-221) · Curso §14.2"
  },
  {
    topic: "Buenas prácticas",
    q: "¿Cuál de estas afirmaciones es correcta al analizar datos de BLC?",
    options: [
      "Si existe un installment, ya existe un cobro asociado.",
      "La existencia de un installment no implica que exista un payment: hay que recorrer la cadena completa.",
      "Todo endoso genera siempre exactamente dos movimientos.",
      "El saldo negativo implica que la devolución ya se ejecutó."
    ],
    answer: 1,
    why: "El installment es una instrucción financiera. El cobro o pago real solo existe si hay payment y application asociados.",
    src: "Curso §16, reglas 12 a 14 · Modelo BLC, cadena installment → transaction → payment"
  },
  {
    topic: "Consultas seguras",
    q: "Según las reglas del agent-bundle, ¿cómo debe consultarse la base INSIS durante un análisis?",
    options: [
      "Con permisos de escritura para corregir datos inconsistentes.",
      "Solo con SELECT de lectura y limitando filas con <code>ROWNUM</code>.",
      "Ejecutando DELETE sobre registros duplicados.",
      "Con TRUNCATE previo para limpiar el entorno."
    ],
    answer: 1,
    why: "El acceso es estrictamente read-only, con límite de filas y sin DML ni DDL. Los datos personales además se enmascaran.",
    src: "agent-bundle, reglas de seguridad y guardrails de consulta · Curso §15"
  }
];

/* Glosario operativo */
const GLOSSARY = [
  { t: "Account", d: "Cuenta financiera de una parte bajo un rol determinado. Define perfil de facturación, cobranza y pago.", s: "BLC_ACCOUNTS (pág. 2-9)" },
  { t: "Billing item", d: "Acuerdo o motivo concreto que se factura o se paga: póliza, comisión, siniestro, reaseguro.", s: "BLC_ITEMS (pág. 92-98)" },
  { t: "Installment", d: "Importe a cobrar o pagar en una fecha, dentro de un item. Máximo nivel de detalle.", s: "BLC_INSTALLMENTS (pág. 83-91)" },
  { t: "Transaction", d: "Conversión del installment en un receivable o payable con saldo propio.", s: "BLC_TRANSACTIONS (pág. 237-245)" },
  { t: "Document", d: "Representación formal que agrupa transactions: factura, nota, solicitud de pago, recibo.", s: "BLC_DOCUMENTS (pág. 62-69)" },
  { t: "Application", d: "Registro que explica cómo un pago o crédito se imputa a una transaction, item, cuenta o actividad.", s: "BLC_APPLICATIONS (pág. 16-23)" },
  { t: "Payment", d: "Dinero realmente recibido (incoming) o enviado (outgoing).", s: "BLC_PAYMENTS (pág. 140-152)" },
  { t: "Clearing", d: "Confirmación bancaria de que el movimiento de fondos se concretó.", s: "BLC_CLEARINGS (pág. 53-56)" },
  { t: "Open balance", d: "Saldo pendiente de una transaction o payment. Negativo indica crédito a favor de la contraparte.", s: "BLC_TRANSACTIONS (pág. 243)" },
  { t: "Lookup", d: "Valor de catálogo agrupado por LOOKUP_SET, con tags que definen comportamiento del sistema.", s: "BLC_LOOKUPS (pág. 105-113)" },
  { t: "SLA event", d: "Evento de subledger que representa un impacto financiero contabilizable.", s: "BLC_SLA_EVENTS (pág. 215-219)" },
  { t: "Annex", d: "Referencia al endoso que originó o modificó un movimiento financiero.", s: "BLC_INSTALLMENTS.ANNEX (pág. 87)" },
  { t: "Remittance advice", d: "Instrucción que indica cómo distribuir un pago masivo entre documentos o transactions.", s: "BLC_REMITTANCES (pág. 186-191)" },
  { t: "Pay run", d: "Proceso que selecciona importes pendientes y genera los payments correspondientes.", s: "BLC_PAY_RUN (pág. 167-171)" }
];
