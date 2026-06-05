export interface TestModule {
  name: string;
  description: string;
  run: () => Promise<TestResult>;
}

export interface TestResult {
  success: boolean;
  message: string;
  details?: any;
}
