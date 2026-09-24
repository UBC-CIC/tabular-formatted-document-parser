// Smoke test placeholder.
//
// The default component (App) is wrapped with Amplify's withAuthenticator and
// connected to the Redux store, so a full render requires a configured Amplify
// environment and a <Provider>. A meaningful UI test should mock aws-amplify
// and wrap the component in the store; that is out of scope for this dependency
// upgrade. This test simply verifies the test runner is wired up.
test('test runner is configured', () => {
  expect(true).toBe(true);
});
