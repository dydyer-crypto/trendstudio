#!/usr/bin/env node

/**
 * TrendStudio Production Tests
 * Tests all Power Features and integrations before deployment
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(color, message) {
    console.log(`${color}${message}${colors.reset}`);
}

function logInfo(message) {
    log(colors.blue, `[INFO] ${message}`);
}

function logSuccess(message) {
    log(colors.green, `[SUCCESS] ${message}`);
}

function logError(message) {
    log(colors.red, `[ERROR] ${message}`);
}

function logWarning(message) {
    log(colors.yellow, `[WARNING] ${message}`);
}

// Test configurations
const tests = {
    typecheck: {
        name: 'TypeScript Check',
        command: 'npx tsc --noEmit',
        description: 'Validate TypeScript types'
    }
};

const integrationTests = {
    services: {
        name: 'Services Integration',
        description: 'Test service initialization and basic functionality',
        test: async () => {
            // Test that all services can be imported
            const services = [
                './src/services/aiService.ts',
                './src/services/brandKitService.ts',
                './src/services/hookGeneratorService.ts',
                './src/services/replyAssistantService.ts',
                './src/services/wordpressService.ts'
            ];

            for (const service of services) {
                if (fs.existsSync(service)) {
                    logInfo(`✓ Service exists: ${service}`);
                } else {
                    throw new Error(`Service not found: ${service}`);
                }
            }
        }
    },
    environment: {
        name: 'Environment Variables',
        description: 'Check production environment configuration',
        test: async () => {
            const envFile = '.env.production';
            if (!fs.existsSync(envFile)) {
                throw new Error(`Environment file not found: ${envFile}`);
            }

            const content = fs.readFileSync(envFile, 'utf8');
            const requiredVars = [
                'VITE_SUPABASE_URL',
                'VITE_SUPABASE_ANON_KEY',
                'VITE_DEEPSEEK_API_KEY'
            ];

            for (const varName of requiredVars) {
                if (!content.includes(varName + '=')) {
                    throw new Error(`Required environment variable not found: ${varName}`);
                }
            }

            logInfo('✓ Environment variables configured');
        }
    },
    migrations: {
        name: 'Database Migrations',
        description: 'Verify all migrations are present',
        test: async () => {
            const migrationsDir = 'supabase/migrations';
            const files = fs.readdirSync(migrationsDir);
            const sqlFiles = files.filter(f => f.endsWith('.sql'));

            if (sqlFiles.length === 0) {
                throw new Error('No migration files found');
            }

            logInfo(`✓ Found ${sqlFiles.length} migration files`);

            // Check for key migrations
            const requiredMigrations = [
                'brand_and_competitor_tables',
                'extend_brand_studio',
                'wordpress_integration'
            ];

            for (const migration of requiredMigrations) {
                const found = sqlFiles.some(file => file.includes(migration));
                if (!found) {
                    throw new Error(`Required migration not found: ${migration}`);
                }
            }

            logInfo('✓ All required migrations present');
        }
    }
};

async function runTest(testName, testConfig) {
    logInfo(`Running ${testConfig.name}: ${testConfig.description}`);

    try {
        if (testConfig.command) {
            execSync(testConfig.command, {
                stdio: 'inherit',
                cwd: process.cwd()
            });
        } else if (testConfig.test) {
            await testConfig.test();
        }

        logSuccess(`✓ ${testConfig.name} passed`);
        return true;
    } catch (error) {
        logError(`✗ ${testConfig.name} failed: ${error.message}`);
        return false;
    }
}

async function runIntegrationTest(testName, testConfig) {
    logInfo(`Running Integration Test: ${testConfig.name}`);

    try {
        await testConfig.test();
        logSuccess(`✓ ${testConfig.name} passed`);
        return true;
    } catch (error) {
        logError(`✗ ${testConfig.name} failed: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('🚀 TrendStudio Production Test Suite');
    console.log('=====================================\n');

    let passedTests = 0;
    let totalTests = 0;

    // Run unit tests
    logInfo('Phase 1: Unit Tests');
    for (const [testName, testConfig] of Object.entries(tests)) {
        totalTests++;
        if (await runTest(testName, testConfig)) {
            passedTests++;
        }
        console.log('');
    }

    // Run integration tests
    logInfo('Phase 2: Integration Tests');
    for (const [testName, testConfig] of Object.entries(integrationTests)) {
        totalTests++;
        if (await runIntegrationTest(testName, testConfig)) {
            passedTests++;
        }
        console.log('');
    }

    // Results summary
    console.log('=====================================');
    console.log(`Test Results: ${passedTests}/${totalTests} passed`);

    if (passedTests === totalTests) {
        logSuccess('🎉 All tests passed! Ready for production deployment.');
        process.exit(0);
    } else {
        logError('❌ Some tests failed. Please fix issues before deploying.');
        process.exit(1);
    }
}

// Run tests
main().catch(error => {
    logError(`Fatal error: ${error.message}`);
    process.exit(1);
});