import log from 'loglevel';

// Configurar el nivel de logs (puedes cambiarlo entre 'debug', 'info', 'warn', 'error')
log.setLevel('debug');

log.debug("Este es un log de depuración");
log.info("Este es un log informativo");
log.warn("Este es un log de advertencia");
log.error("Este es un log de error");

export default log;