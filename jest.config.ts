import type {Config} from "@jest/types";

const config: Config.InitialOptions = {
    preset: "ts-jest",
    testEnvironment: "node",
    verbose: true,
    moduleNameMapper: {
        "^@builders/(.*)$": "<rootDir>/src/builders/$1",
        "^@interfaces/(.*)$": "<rootDir>/src/interfaces/$1",
        "^@models/(.*)$": "<rootDir>/src/models/$1",
        "^@/(.*)$": "<rootDir>/src/$1"
    },
    modulePaths: ["<rootDir>"],
    transform: {
        "^.+\\.ts$": ["ts-jest", {
            tsconfig: {
                target: "ES2020",
                lib: ["ES2020", "ES2017", "DOM"],
                module: "CommonJS",
                strict: true,
                esModuleInterop: true,
                allowSyntheticDefaultImports: true,
                moduleResolution: "node",
                resolveJsonModule: true,
                baseUrl: ".",
                paths: {
                    "@builders/*": ["./src/builders/*"],
                    "@interfaces/*": ["./src/interfaces/*"],
                    "@models/*": ["./src/models/*"],
                    "@/*": ["./src/*"]
                },
                skipLibCheck: true
            }
        }]
    },
    testMatch: [
        "**/__tests__/**/*.ts",
        "**/?(*.)+(spec|test).ts"
    ],
    moduleFileExtensions: ["ts", "js", "json"],
    collectCoverageFrom: [
        "src/**/*.ts",
        "!src/**/*.d.ts"
    ]
}

export default config