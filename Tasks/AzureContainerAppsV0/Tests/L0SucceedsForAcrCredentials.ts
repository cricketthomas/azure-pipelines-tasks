import * as ma from 'azure-pipelines-task-lib/mock-answer';
import * as tmrm from 'azure-pipelines-task-lib/mock-run';
import * as path from 'path';

const taskPath = path.join(__dirname, '..', 'azurecontainerapps.js');
const tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

// Set required arguments for the test
tmr.setInput('cwd', '/fakecwd');
tmr.setInput('connectedServiceNameARM', 'test-connectedServiceNameARM');
tmr.setInput('acrName', 'sampletestacr');
tmr.setInput('acrUsername', 'acrtestusername');
tmr.setInput('acrPassword', 'acrtestpassword');
tmr.setInput('appSourcePath', '/samplepath');
tmr.setInput('disableTelemetry', 'true');

const tl = require('azure-pipelines-task-lib/mock-task');
const tlClone = Object.assign({}, tl);

// Assign dummy values for build variables
tlClone.getVariable = function(variable: string) {
    if (variable.toLowerCase() === 'build.buildid') {
        return 'test-build-id';
    } else if (variable.toLowerCase() === 'build.buildnumber') {
        return 'test-build-number';
    }
    return null;
};
tlClone.assertAgent = function(variable: string) {
    return;
};
tmr.registerMock('azure-pipelines-task-lib/mock-task', tlClone);

// Mock out function calls for the Utility class
tmr.registerMock('./src/Utility', {
    Utility: function() {
        return {
            setAzureCliDynamicInstall: function() {
                return;
            },
            isNullOrEmpty(str: string): boolean {
                return str === null || str === undefined || str === "";
            }
        };
    }
});

// Mock out function calls for the ContainerAppHelper class
tmr.registerMock('./src/ContainerAppHelper', {
    ContainerAppHelper: function() {
        return {
            installPackCliAsync: async function() {
                return;
            },
            determineRuntimeStackAsync: async function(path: string) {
                return 'dotnetcore:7.0';
            },
            setDefaultBuilder: function() {
                return;
            },
            createRunnableAppImage: function(imageToDeploy: string, appSourcePath: string, runtimeStack: string) {
                return;
            },
            createOrUpdateContainerApp: function(containerAppName: string, resourceGroup: string, imageToDeploy: string, optionCmdArgs: string[]) {
                return;
            }
        };
    }
});

// Mock out function calls for the AzureAuthenticationHelper class
tmr.registerMock('./src/AzureAuthenticationHelper', {
    AzureAuthenticationHelper: function() {
        return {
            loginAzureRM: function() {
                return;
            },
            logoutAzure: function() {
                return;
            }
        };
    }
});

// Mock out function calls for the ContainerRegistryHelper class
tmr.registerMock('./src/ContainerRegistryHelper', {
    ContainerRegistryHelper: function() {
        return {
            loginAcrWithUsernamePassword: async function(acrName: string, acrUsername: string, acrPassword: string) {
                return;
            },
            pushImageToAcr: function() {
                return;
            }
        };
    }
});

// Mock fs
const fs = require('fs');
const fsClone = Object.assign({}, fs);
fsClone.existsSync = function(filePath: any) {
    return false;
};
tmr.registerMock('fs', fsClone);

// Mock out command calls
const a: ma.TaskLibAnswers = <ma.TaskLibAnswers>{
    'which': {
        'bash': 'path/to/bash'
    },
    'checkPath': {
        'path/to/bash': true,
        '/fakecwd': true
    },
    'path/to/bash': {
        '*': {
            'code': 0
        }
    }
};
tmr.setAnswers(a);

// Run the mocked task test
tmr.run();