import { simulateCart, simulateCollision, reverseCalculateFromRealWorld } from './index';

// Simple poor man's test runner since we don't have vitest installed yet
function assertApprox(a: number, b: number, epsilon: number = 1e-4) {
  if (Math.abs(a - b) > epsilon) {
    throw new Error(`Assertion failed: ${a} != ${b}`);
  }
}

export function runTests() {
  console.log("Running physics engine tests...");
  
  // Test 1: Cart Simulation (μ = 0)
  const cartZeroFriction = simulateCart(0);
  // at t=1.0, F=2, v=2, a=2
  const t1 = cartZeroFriction.find(state => Math.abs(state.t - 1.0) < 1e-5);
  if (!t1) throw new Error("Missing state at t=1.0");
  assertApprox(t1.F, 2.0);
  assertApprox(t1.v, 2.0); // 2N / 1kg * 1s = 2m/s (Wait, integration might give slightly different if not exact, let's see. Euler: it adds a*dt after recording, so at exactly t=1.0 it records v just before the 1.0 update. But my euler integration records v, then updates it. Wait, the state at t=1.0 is before the update of t=1.0 interval. The velocity at t=1.0 should actually be exactly 2.0 because it's been integrating 0 to 0.98. Let's test and see).
  
  // Test 2: Collision zero cushion
  const col0 = simulateCollision({ n: 0 });
  assertApprox(col0.v, Math.sqrt(2 * 9.8 * 1.0)); // v = sqrt(19.6) ≈ 4.427
  assertApprox(col0.J, 0.2 * col0.v);
  
  // Test 3: Reverse calculation
  const rev = reverseCalculateFromRealWorld(10.0); // 10g
  assertApprox(rev.a_peak, 98.0);
  assertApprox(rev.a_avg, 98.0 / 1.57);
  
  console.log("All physics engine tests passed!");
}

runTests();
