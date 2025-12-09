// Test script to verify stage transition validation logic

// Define strict stage progression rules (matching CandidateSummaryS2 and WorkflowV2)
const getNextAllowedStage = (currentStage) => {
  const stageOrder = {
    'applied': 'shortlisted',
    'shortlisted': 'interview_scheduled',
    'interview_scheduled': 'interview_passed',
    'interview_passed': null // Final stage
  }
  return stageOrder[currentStage]
}

const validateStageTransition = (currentStage, targetStage) => {
  // Allow pass/fail from interview_scheduled stage
  if (currentStage === 'interview_scheduled' && 
      (targetStage === 'interview_passed' || targetStage === 'interview_failed')) {
    return true
  }
  
  // Strict progression: allow only immediate next stage
  const nextAllowed = getNextAllowedStage(currentStage)
  return targetStage === nextAllowed
}

const getValidNextStages = (currentStage) => {
  const validStages = []
  
  // Add the next allowed stage
  const nextStage = getNextAllowedStage(currentStage)
  if (nextStage) {
    validStages.push(nextStage)
  }
  
  // Special case: from interview_scheduled, allow both pass and fail
  if (currentStage === 'interview_scheduled') {
    validStages.push('interview_passed')
    // Optionally add interview_failed if you want to support it
    // validStages.push('interview_failed')
  }
  
  return validStages
}

console.log('=== Stage Transition Validation Tests ===\n')

// Test cases
const testCases = [
  // Valid transitions
  { from: 'applied', to: 'shortlisted', expected: true },
  { from: 'shortlisted', to: 'interview_scheduled', expected: true },
  { from: 'interview_scheduled', to: 'interview_passed', expected: true },
  
  // Invalid transitions (skipping stages)
  { from: 'applied', to: 'interview_scheduled', expected: false },
  { from: 'applied', to: 'interview_passed', expected: false },
  { from: 'shortlisted', to: 'interview_passed', expected: false },
  
  // Invalid transitions (backward)
  { from: 'interview_passed', to: 'applied', expected: false },
  { from: 'interview_scheduled', to: 'applied', expected: false },
  { from: 'shortlisted', to: 'applied', expected: false },
  
  // Invalid transitions (from final stage)
  { from: 'interview_passed', to: 'shortlisted', expected: false },
  { from: 'interview_passed', to: 'interview_scheduled', expected: false },
]

console.log('Testing validateStageTransition():\n')
testCases.forEach(({ from, to, expected }) => {
  const result = validateStageTransition(from, to)
  const status = result === expected ? '✅ PASS' : '❌ FAIL'
  console.log(`${status}: ${from} → ${to} = ${result} (expected: ${expected})`)
})

console.log('\n=== Valid Next Stages for Each Stage ===\n')

const stages = ['applied', 'shortlisted', 'interview_scheduled', 'interview_passed']
stages.forEach(stage => {
  const validNext = getValidNextStages(stage)
  console.log(`${stage}:`)
  if (validNext.length > 0) {
    validNext.forEach(next => console.log(`  → ${next}`))
  } else {
    console.log(`  → (No further stages - final stage)`)
  }
})

console.log('\n=== Dropdown Options Test ===\n')

// Simulate what the UI dropdown should show
stages.forEach(currentStage => {
  const validNext = getValidNextStages(currentStage)
  console.log(`Current Stage: ${currentStage}`)
  console.log(`Dropdown Options:`)
  console.log(`  - Current: ${currentStage}`)
  if (validNext.length > 0) {
    validNext.forEach(next => console.log(`  - Move to: ${next}`))
  } else {
    console.log(`  - (No further stages available)`)
  }
  console.log('')
})
