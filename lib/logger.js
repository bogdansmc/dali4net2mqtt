class Log {
    /**
     * @param {string} namespaceLog Logging namespace to prefix
     * @param {string} level The log level
     * @param {object} logger logger instance
     */
    constructor(namespaceLog, level, logger) {
        this.namespaceLog = namespaceLog;
        this.level = level;
        // We have to bind the this context here or it is possible that `this` is
        // undefined when passing around the logger methods. This happens e.g. when doing this:
        //   const log = new Log(...);
        //   const test = log.info;
        //   test();
        this.logger = logger;
        this.silly = this.silly.bind(this);
        this.debug = this.debug.bind(this);
        this.info  = this.info.bind(this);
        this.error = this.error.bind(this);
        this.warn  = this.warn.bind(this);
    }
    getDate() {
	    let dt = new Date();
//	    return dt.toISOString();
//	    return dt.toLocaleTimeString();
	    return dt.toLocaleString('en-GB', { hour12: false });
    }
    silly(msg) {
	    console.log(this.getDate()+" [silly] " + msg);
    }
    debug(msg) {
	    console.log(this.getDate()+" [debug] " + msg);
    }
    info(msg) {
	    console.log(this.getDate()+" [info] " + msg);
    }
    error(msg) {
	    console.log(this.getDate()+" [error] " + msg);
    }
    warn(msg) {
	    console.log(this.getDate()+" [warn] " + msg);
    }
}

module.exports = Log;
