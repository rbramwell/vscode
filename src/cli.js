/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

const bootstrap = require('./bootstrap');

// Enable portable support
bootstrap.configurePortable();

// Enable ASAR support
bootstrap.enableASARSupport();

// Load CLI through AMD loader
require('./bootstrap-amd').load('vs/code/node/cli');