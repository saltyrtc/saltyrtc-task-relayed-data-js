/**
 * Integration tests.
 *
 * Copyright (C) 2018 Threema GmbH
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */
import {Config} from "./config";
import {sleep} from "./utils";
import {RelayedDataTask} from "../src/task";

/// <reference types="jasmine" />

let spec: any;

export default () => { describe('Integration Tests', function() {

    beforeEach(() => {
        this.initiator = new saltyrtcClient.SaltyRTCBuilder()
            .connectTo(Config.SALTYRTC_HOST, Config.SALTYRTC_PORT)
            .withKeyStore(new saltyrtcClient.KeyStore())
            .usingTasks([new RelayedDataTask()])
            .asInitiator();

        let pubKey = this.initiator.permanentKeyBytes;
        let authToken = this.initiator.authTokenBytes;
        this.responder = new saltyrtcClient.SaltyRTCBuilder()
            .connectTo(Config.SALTYRTC_HOST, Config.SALTYRTC_PORT)
            .withKeyStore(new saltyrtcClient.KeyStore())
            .initiatorInfo(pubKey, authToken)
            .usingTasks([new RelayedDataTask()])
            .asResponder();

        // Helper function. Connect both clients and resolve once they both finished the peer handshake.
        this.connectBoth = (a: saltyrtc.SaltyRTC, b: saltyrtc.SaltyRTC) => {
            let ready = 0;
            return new Promise((resolve) => {
                const handler = () => { if (++ready == 2) resolve() };
                a.once('state-change:task', handler);
                b.once('state-change:task', handler);
                a.connect();
                b.connect();
            });
        }
    });

    describe('Relayed Data Task', () => {

        spec = it('connect (initiator first)', async (done) => {
            console.info('===> TEST NAME:', spec.getFullName());
            expect(this.initiator.state).toEqual('new');
            expect(this.responder.state).toEqual('new');

            this.initiator.connect();
            expect(this.initiator.state).toEqual('ws-connecting');

            await sleep(1000);
            expect(this.initiator.state === 'server-handshake' ||
                this.initiator.state === 'peer-handshake').toBe(true);

            this.responder.connect();
            expect(this.responder.state).toEqual('ws-connecting');

            await sleep(1000);
            expect(this.initiator.state).toBe('task');
            expect(this.responder.state).toBe('task');

            done();
        });

    });

}); }
