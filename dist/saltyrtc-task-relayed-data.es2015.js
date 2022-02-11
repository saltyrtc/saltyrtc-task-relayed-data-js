/**
 * saltyrtc-task-relayed-data v0.4.0
 * A SaltyRTC Relayed Data task implementation.
 * https://github.com/saltyrtc/saltyrtc-task-relayed-data-js#readme
 *
 * Copyright (C) 2018-2022 Threema GmbH
 *
 * This software may be modified and distributed under the terms
 * of the MIT license:
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict';

class RelayedDataTask {
    constructor(debug = false) {
        this.debugging = false;
        this.initialized = false;
        this.eventRegistry = new saltyrtcClient.EventRegistry();
        this.debugging = debug;
    }
    get logTag() {
        if (this.signaling === null || this.signaling === undefined) {
            return '[SaltyRTC.RelayedData]';
        }
        return '[SaltyRTC.RelayedData.' + this.signaling.role + ']';
    }
    setDebug(enabled) {
        this.debugging = enabled;
    }
    debug(...args) {
        if (this.debugging) {
            console.debug(this.logTag, ...args);
        }
    }
    sendMessage(data) {
        this.signaling.sendTaskMessage({
            type: RelayedDataTask.TYPE_DATA,
            p: data,
        });
    }
    init(signaling, data) {
        this.debug('init');
        this.signaling = signaling;
        this.initialized = true;
    }
    onPeerHandshakeDone() {
        this.debug('onPeerHandshakeDone');
    }
    onTaskMessage(message) {
        this.debug('New task message arrived: ' + message.type);
        switch (message.type) {
            case RelayedDataTask.TYPE_DATA:
                if (this.validateData(message) !== true) {
                    return;
                }
                this.emit({ type: RelayedDataTask.EVENT_DATA, data: message[RelayedDataTask.KEY_PAYLOAD] });
                break;
            default:
                console.error(this.logTag, 'Received message with invalid type:', message.type);
        }
    }
    sendSignalingMessage(payload) {
        throw new saltyrtcClient.SignalingError(saltyrtcClient.CloseCode.ProtocolError, 'sendSignalingMessage called even though task does not implement handover');
    }
    getName() {
        return RelayedDataTask.PROTOCOL_NAME;
    }
    getSupportedMessageTypes() {
        return [RelayedDataTask.TYPE_DATA];
    }
    getData() {
        return {};
    }
    close(reason) {
        this.debug('Closing connection:', saltyrtcClient.explainCloseCode(reason));
    }
    on(event, handler) {
        this.eventRegistry.register(event, handler);
    }
    once(event, handler) {
        const onceHandler = (ev) => {
            try {
                handler(ev);
            }
            catch (e) {
                this.off(ev.type, onceHandler);
                throw e;
            }
            this.off(ev.type, onceHandler);
        };
        this.eventRegistry.register(event, onceHandler);
    }
    off(event, handler) {
        if (event === undefined) {
            this.eventRegistry.unregisterAll();
        }
        else {
            this.eventRegistry.unregister(event, handler);
        }
    }
    emit(event) {
        this.debug('New event:', event.type);
        const handlers = this.eventRegistry.get(event.type);
        for (const handler of handlers) {
            try {
                this.callHandler(handler, event);
            }
            catch (e) {
                console.error(this.logTag, 'Unhandled exception in', event.type, 'handler:', e);
            }
        }
    }
    callHandler(handler, event) {
        const response = handler(event);
        if (response === false) {
            this.eventRegistry.unregister(event.type, handler);
        }
    }
    validateData(message) {
        if (message[RelayedDataTask.KEY_PAYLOAD] === undefined) {
            console.warn(this.logTag, 'Data message does not contain payload');
            return false;
        }
        return true;
    }
}
RelayedDataTask.PROTOCOL_NAME = 'v0.relayed-data.tasks.saltyrtc.org';
RelayedDataTask.TYPE_DATA = 'data';
RelayedDataTask.KEY_PAYLOAD = 'p';
RelayedDataTask.EVENT_DATA = 'data';

export { RelayedDataTask };
//# sourceMappingURL=saltyrtc-task-relayed-data.es2015.js.map
