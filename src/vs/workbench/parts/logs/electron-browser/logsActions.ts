/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as nls from 'vs/nls';
import { Action } from 'vs/base/common/actions';
import * as paths from 'vs/base/common/paths';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IWindowsService } from 'vs/platform/windows/common/windows';
import { TPromise } from 'vs/base/common/winjs.base';
import { ILogService, LogLevel, DEFAULT_LOG_LEVEL } from 'vs/platform/log/common/log';
import { IOutputService, COMMAND_OPEN_LOG_VIEWER } from 'vs/workbench/parts/output/common/output';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { URI } from 'vs/base/common/uri';
import { IQuickPickItem, IQuickInputService } from 'vs/platform/quickinput/common/quickInput';

export class OpenLogsFolderAction extends Action {

	static ID = 'workbench.action.openLogsFolder';
	static LABEL = nls.localize('openLogsFolder', "Open Logs Folder");

	constructor(id: string, label: string,
		@IEnvironmentService private environmentService: IEnvironmentService,
		@IWindowsService private windowsService: IWindowsService,
	) {
		super(id, label);
	}

	run(): TPromise<void> {
		return this.windowsService.showItemInFolder(paths.join(this.environmentService.logsPath, 'main.log'));
	}
}

export class ShowLogsAction extends Action {

	static ID = 'workbench.action.showLogs';
	static LABEL = nls.localize('showLogs', "Show Logs...");

	constructor(id: string, label: string,
		@IQuickInputService private quickInputService: IQuickInputService,
		@IOutputService private outputService: IOutputService
	) {
		super(id, label);
	}

	run(): TPromise<void> {
		const entries: IQuickPickItem[] = this.outputService.getChannelDescriptors().filter(c => c.file && c.log)
			.map(({ label, id }) => (<IQuickPickItem>{ id, label }));

		return this.quickInputService.pick(entries, { placeHolder: nls.localize('selectlog', "Select Log") })
			.then(entry => {
				if (entry) {
					return this.outputService.showChannel(entry.id);
				}
				return null;
			});
	}
}

export class OpenLogFileAction extends Action {

	static ID = 'workbench.action.openLogFile';
	static LABEL = nls.localize('openLogFile', "Open Log File...");

	constructor(id: string, label: string,
		@IQuickInputService private quickInputService: IQuickInputService,
		@IEnvironmentService private environmentService: IEnvironmentService,
		@ICommandService private commandService: ICommandService,
		@IOutputService private outputService: IOutputService
	) {
		super(id, label);
	}

	run(): TPromise<void> {
		const entries: IQuickPickItem[] = this.outputService.getChannelDescriptors().filter(c => c.file && c.log)
			.map(({ label, file }) => (<IQuickPickItem>{ id: file.toString(), label }));
		entries.push({ id: URI.file(paths.join(this.environmentService.logsPath, `telemetry.log`)).toString(), label: nls.localize('telemetry', "Telemetry") });

		return this.quickInputService.pick(entries, { placeHolder: nls.localize('selectlogFile', "Select Log file") })
			.then(entry => {
				if (entry) {
					return this.commandService.executeCommand(COMMAND_OPEN_LOG_VIEWER, URI.parse(entry.id));
				}
				return null;
			});
	}
}

export class SetLogLevelAction extends Action {

	static ID = 'workbench.action.setLogLevel';
	static LABEL = nls.localize('setLogLevel', "Set Log Level...");

	constructor(id: string, label: string,
		@IQuickInputService private quickInputService: IQuickInputService,
		@ILogService private logService: ILogService
	) {
		super(id, label);
	}

	run(): TPromise<void> {
		const current = this.logService.getLevel();
		const entries = [
			{ label: nls.localize('trace', "Trace"), level: LogLevel.Trace, description: this.getDescription(LogLevel.Trace, current) },
			{ label: nls.localize('debug', "Debug"), level: LogLevel.Debug, description: this.getDescription(LogLevel.Debug, current) },
			{ label: nls.localize('info', "Info"), level: LogLevel.Info, description: this.getDescription(LogLevel.Info, current) },
			{ label: nls.localize('warn', "Warning"), level: LogLevel.Warning, description: this.getDescription(LogLevel.Warning, current) },
			{ label: nls.localize('err', "Error"), level: LogLevel.Error, description: this.getDescription(LogLevel.Error, current) },
			{ label: nls.localize('critical', "Critical"), level: LogLevel.Critical, description: this.getDescription(LogLevel.Critical, current) },
			{ label: nls.localize('off', "Off"), level: LogLevel.Off, description: this.getDescription(LogLevel.Off, current) },
		];

		return this.quickInputService.pick(entries, { placeHolder: nls.localize('selectLogLevel', "Select log level"), activeItem: entries[this.logService.getLevel()] }).then(entry => {
			if (entry) {
				this.logService.setLevel(entry.level);
			}
		});
	}

	private getDescription(level: LogLevel, current: LogLevel): string {
		if (DEFAULT_LOG_LEVEL === level && current === level) {
			return nls.localize('default and current', "Default & Current");
		}
		if (DEFAULT_LOG_LEVEL === level) {
			return nls.localize('default', "Default");
		}
		if (current === level) {
			return nls.localize('current', "Current");
		}
		return void 0;
	}
}
