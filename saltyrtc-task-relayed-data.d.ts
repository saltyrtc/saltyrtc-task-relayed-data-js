/**
 * Copyright (C) 2018 Threema GmbH
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

declare namespace saltyrtc.tasks.relayed_data {

    interface RelayedDataTask extends saltyrtc.Task {

        /**
         * Send an end-to-end encrypted message through the WebSocket.
         */
        sendMessage(data: any): void;

        /**
         * Enable or disable debug logs.
         */
        setDebug(enabled: boolean): void;

        /**
         * Attach an event handler to the specified event(s).
         *
         * Note: The same event handler object cannot be registered multiple
         * times. It will only run once.
         */
        on(event: string | string[], handler: saltyrtc.SaltyRTCEventHandler): void;

        /**
         * Attach a one-time event handler to the specified event(s).
         *
         * Note: If the same handler was already registered previously as a
         * regular event handler, it will be completely removed after running
         * once.
         */
        once(event: string | string[], handler: saltyrtc.SaltyRTCEventHandler): void;

        /**
         * Remove an event handler from the specified event(s).
         *
         * If no handler is specified, remove all handlers for the specified
         * event(s).
         *
         * If no event name is specified, all event handlers will be cleared.
         */
        off(event?: string | string[], handler?: saltyrtc.SaltyRTCEventHandler): void;

    }

    interface RelayedDataTaskStatic {
        new(debug?: boolean): RelayedDataTask;
    }

}

declare var saltyrtcTaskRelayedData: {
    RelayedDataTask: saltyrtc.tasks.relayed_data.RelayedDataTaskStatic,
};
