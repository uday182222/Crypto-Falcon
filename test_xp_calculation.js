// XP Calculation Test
function testXPCalculation() {
  console.log('🧪 Testing XP Calculation Formula');
  console.log('========================================');
  
  // Test cases
  const testCases = [
    { level: 1, xp: 0, expectedProgress: 0 },
    { level: 1, xp: 50, expectedProgress: 50 },
    { level: 1, xp: 100, expectedProgress: 100 },
    { level: 2, xp: 100, expectedProgress: 0 },
    { level: 2, xp: 175, expectedProgress: 50 },
    { level: 2, xp: 250, expectedProgress: 100 },
    { level: 3, xp: 250, expectedProgress: 0 },
    { level: 3, xp: 350, expectedProgress: 50 },
    { level: 3, xp: 450, expectedProgress: 100 }
  ];
  
  testCases.forEach((testCase, index) => {
    const { level, xp, expectedProgress } = testCase;
    
    // Calculate using the same formula as the frontend
    const xpNeededForNextLevel = 100 + (level - 1) * 50;
    const xpProgress = Math.max(0, Math.min(100, (xp / xpNeededForNextLevel) * 100));
    
    console.log(`Test ${index + 1}:`);
    console.log(`  Level: ${level}, XP: ${xp}`);
    console.log(`  XP needed for next level: ${xpNeededForNextLevel}`);
    console.log(`  Calculated progress: ${xpProgress.toFixed(1)}%`);
    console.log(`  Expected progress: ${expectedProgress}%`);
    console.log(`  ✅ ${Math.abs(xpProgress - expectedProgress) < 1 ? 'PASS' : 'FAIL'}`);
    console.log('');
  });
}

// Run the test
testXPCalculation();

// Example with real user data
console.log('📊 Example with Real User Data:');
const userLevel = 5;
const userXP = 210;

const xpNeededForCurrentLevel = 100 + (userLevel - 1) * 50;
const xpNeededForNextLevel = 100 + userLevel * 50;
const xpProgress = Math.max(0, Math.min(100, ((userXP - xpNeededForCurrentLevel) / (xpNeededForNextLevel - xpNeededForCurrentLevel)) * 100));

console.log(`User Level: ${userLevel}, XP: ${userXP}`);
console.log(`XP needed for current level: ${xpNeededForCurrentLevel}`);
console.log(`XP needed for next level: ${xpNeededForNextLevel}`);
console.log(`Progress: ${xpProgress.toFixed(1)}%`);
console.log(`XP to next level: ${xpNeededForNextLevel - userXP}`); 