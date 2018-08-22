/**
 * Copyright (C) 2018 Threema GmbH
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

/// <reference types="@saltyrtc/client" />

/**
 * Relayed Data Task.
 */
export class RelayedDataTask implements saltyrtc.tasks.relayed_data.RelayedDataTask {

    // Constants
    private static PROTOCOL_NAME = 'v0.relayed-data.tasks.saltyrtc.org';
    private static TYPE_DATA = 'data';
    private static KEY_PAYLOAD = 'p';
    private static EVENT_DATA = 'data';

    // Debugging enabled?
    private debugging = false;

    // Initialization state
    private initialized = false;

    // Signaling
    private signaling: saltyrtc.Signaling;

    // Events
    private eventRegistry: saltyrtc.EventRegistry = new saltyrtcClient.EventRegistry();

    // Log tag
    private get logTag(): string {
        if (this.signaling === null || this.signaling === undefined) {
            return '[SaltyRTC.RelayedData]';
        }
        return '[SaltyRTC.RelayedData.' + this.signaling.role + ']';
    }

    /**
     * Enable or disable debug logs.
     */
    public setDebug(enabled: boolean): void {
        this.debugging = enabled;
    }

    /**
     * Log to console.debug if debug mode is enabled.
     */
    private debug(...args: any[]) {
        if (this.debugging) {
            // tslint:disable:no-console
            console.debug(this.logTag, ...args);
        }
    }

    /**
     * Create a new task instance.
     */
    constructor(debug: boolean = false) {
        this.debugging = debug;
    }

    /**
     * Send an end-to-end encrypted message through the WebSocket.
     */
    public sendMessage(data: any): void {
        this.signaling.sendTaskMessage({
            type: RelayedDataTask.TYPE_DATA,
            p: data,
        });
    }

    /**
     * Initialize the task with the task data from the peer.
     *
     * This method should only be called by the signaling class, not by the end user!
     */
    public init(signaling: saltyrtc.Signaling, data: object): void {
        this.debug('init');
        this.signaling = signaling;
        this.initialized = true;
    }

    /**
     * Used by the signaling class to notify task that the peer handshake is over.
     *
     * This method should only be called by the signaling class, not by the end user!
     */
    public onPeerHandshakeDone(): void {
        this.debug('onPeerHandshakeDone');
    }

    /**
     * Handle incoming task messages.
     *
     * This method should only be called by the signaling class, not by the end user!
     */
    public onTaskMessage(message: saltyrtc.messages.TaskMessage): void {
        this.debug('New task message arrived: ' + message.type);
        switch (message.type) {
            case RelayedDataTask.TYPE_DATA:
                if (this.validateData(message) !== true) {
                    return;
                }
                this.emit({type: RelayedDataTask.EVENT_DATA, data: message[RelayedDataTask.KEY_PAYLOAD]});
                break;
            default:
                console.error(this.logTag, 'Received message with invalid type:', message.type);
        }
    }

    /**
     * Send a signaling message *through the data channel*.
     *
     * This method should only be called by the signaling class, not by the end user!
     *
     * @param payload Non-encrypted message
     * @throws SignalingError always
     */
    public sendSignalingMessage(payload: Uint8Array) {
        throw new saltyrtcClient.SignalingError(
            saltyrtcClient.CloseCode.ProtocolError,
            'sendSignalingMessage called even though task does not implement handover',
        );
    }

    /**
     * Return the task protocol name.
     */
    public getName(): string {
        return RelayedDataTask.PROTOCOL_NAME;
    }

    /**
     * Return the list of supported message types.
     *
     * This method should only be called by the signaling class, not by the end user!
     */
    public getSupportedMessageTypes(): string[] {
        // Only return data message. The 'close' and 'application' messages are already handled
        // by the `@saltyrtc/client` library.
        return [RelayedDataTask.TYPE_DATA];
    }

    /**
     * Return the task data used for negotiation in the `auth` message.
     *
     * This method should only be called by the signaling class, not by the end user!
     */
    public getData(): object {
        return {};
    }

    /**
     * This method can be called by the user to close the connection.
     *
     * @param reason The close code.
     */
    public close(reason: number): void {
        this.debug('Closing connection:', saltyrtcClient.explainCloseCode(reason));
    }

    /**
     * Attach an event handler to the specified event(s).
     *
     * Note: The same event handler object cannot be registered multiple
     * times. It will only run once.
     */
    public on(event: string | string[], handler: saltyrtc.SaltyRTCEventHandler): void {
        this.eventRegistry.register(event, handler);
    }

    /**
     * Attach a one-time event handler to the specified event(s).
     *
     * Note: If the same handler was already registered previously as a regular
     * event handler, it will be completely removed after running once.
     */
    public once(event: string | string[], handler: saltyrtc.SaltyRTCEventHandler): void {
        const onceHandler: saltyrtc.SaltyRTCEventHandler = (ev: saltyrtc.SaltyRTCEvent) => {
            try {
                handler(ev);
            } catch (e) {
                // Handle exceptions
                this.off(ev.type, onceHandler);
                throw e;
            }
            this.off(ev.type, onceHandler);
        };
        this.eventRegistry.register(event, onceHandler);
    }

    /**
     * Remove an event handler from the specified event(s).
     *
     * If no handler is specified, remove all handlers for the specified
     * event(s).
     *
     * If no event name is specified, all event handlers will be cleared.
     */
    public off(event?: string | string[], handler?: saltyrtc.SaltyRTCEventHandler): void {
        this.eventRegistry.unregister(event, handler);
    }

    /**
     * Emit an event.
     */
    private emit(event: saltyrtc.SaltyRTCEvent) {
        this.debug('New event:', event.type);
        const handlers = this.eventRegistry.get(event.type);
        for (const handler of handlers) {
            try {
                this.callHandler(handler, event);
            } catch (e) {
                console.error(this.logTag, 'Unhandled exception in', event.type, 'handler:', e);
            }
        }
    }

    /**
     * Call a handler with the specified event.
     *
     * If the handler returns `false`, unregister it.
     */
    private callHandler(handler: saltyrtc.SaltyRTCEventHandler, event: saltyrtc.SaltyRTCEvent) {
        const response = handler(event);
        if (response === false) {
            this.eventRegistry.unregister(event.type, handler);
        }
    }

    /**
     * Validate data messages.
     */
    private validateData(message: saltyrtc.messages.TaskMessage): boolean {
        if (message[RelayedDataTask.KEY_PAYLOAD] === undefined) {
            console.warn(this.logTag, 'Data message does not contain payload');
            return false;
        }
        return true;
    }

}
