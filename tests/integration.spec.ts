/**
 * Integration tests.
 *
 * Copyright (C) 2018-2022 Threema GmbH
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

    let initiator: saltyrtc.SaltyRTC;
    let responder: saltyrtc.SaltyRTC;
    let connectBoth: (a: saltyrtc.SaltyRTC, b: saltyrtc.SaltyRTC) => Promise<void>;

    beforeEach(() => {
        initiator = new saltyrtcClient.SaltyRTCBuilder()
            .connectTo(Config.SALTYRTC_HOST, Config.SALTYRTC_PORT)
            .withKeyStore(new saltyrtcClient.KeyStore())
            .usingTasks([new RelayedDataTask(true)])
            .asInitiator();

        let pubKey = initiator.permanentKeyBytes;
        let authToken = initiator.authTokenBytes;
        responder = new saltyrtcClient.SaltyRTCBuilder()
            .connectTo(Config.SALTYRTC_HOST, Config.SALTYRTC_PORT)
            .withKeyStore(new saltyrtcClient.KeyStore())
            .initiatorInfo(pubKey, authToken)
            .usingTasks([new RelayedDataTask(true)])
            .asResponder();

        // Helper function. Connect both clients and resolve once they both finished the peer handshake.
        connectBoth = (a: saltyrtc.SaltyRTC, b: saltyrtc.SaltyRTC) => {
            let ready = 0;
            return new Promise<void>((resolve) => {
                const handler = () => { if (++ready == 2) resolve() };
                a.once('state-change:task', handler);
                b.once('state-change:task', handler);
                a.connect();
                b.connect();
            });
        }
    });

    describe('Relayed Data Task', () => {

        spec = it('connect (initiator first)', async () => {
            console.info('===> TEST NAME:', spec.getFullName());
            expect(initiator.state).toEqual('new');
            expect(responder.state).toEqual('new');

            initiator.connect();
            expect(initiator.state).toEqual('ws-connecting');

            await sleep(1000);
            expect(initiator.state === 'server-handshake' ||
                initiator.state === 'peer-handshake').toBe(true);

            responder.connect();
            expect(responder.state).toEqual('ws-connecting');

            await sleep(1000);
            expect(initiator.state).toBe('task');
            expect(responder.state).toBe('task');
        });

        spec = it('connect (both)', async () => {
            console.info('===> TEST NAME:', spec.getFullName());
            expect(initiator.state).toEqual('new');
            expect(responder.state).toEqual('new');

            await connectBoth(initiator, responder);

            expect(initiator.state).toBe('task');
            expect(responder.state).toBe('task');
        });

        spec = it('exchange data', async () => {
            console.info('===> TEST NAME:', spec.getFullName());
            expect(initiator.state).toEqual('new');
            expect(responder.state).toEqual('new');

            await connectBoth(initiator, responder);

            expect(initiator.state).toBe('task');
            expect(responder.state).toBe('task');

            const initiatorTask: RelayedDataTask = initiator.getTask() as RelayedDataTask;
            const responderTask: RelayedDataTask = responder.getTask() as RelayedDataTask;

            const exchangedData = new Promise((resolve) => {
                // When the responder receives a message, reply with another message.
                responderTask.on('data', (ev: saltyrtc.SaltyRTCEvent) => {
                    expect(ev.data).toEqual('initiator->responder');
                    responderTask.sendMessage({
                        'hello': 123,
                        'answer': 'responder->initiator',
                    });
                });

                // When the initiator receives a message, validate and resolve.
                initiatorTask.on('data', (ev: saltyrtc.SaltyRTCEvent) => {
                    expect(ev.data).toEqual({
                        'hello': 123,
                        'answer': 'responder->initiator',
                    });
                    resolve();
                });

                // Trigger sending
                initiatorTask.sendMessage('initiator->responder');
            });

            await exchangedData;
        });

    });

}); }
