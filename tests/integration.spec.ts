/**
 * Copyright (C) 2018 Threema GmbH
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

/// <reference types="jasmine" />

export default () => { describe('Integration Tests', function() {

    describe('Testing', () => {
        it('works', () => {
            expect(1 + 2).toEqual(3);
        });
    });

}); }
