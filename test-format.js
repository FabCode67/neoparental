// Test script for formatPredictionResponse function
// Run this in browser console to test formatting

const testResponse = {
  "prediction_value": 4.0,
  "predicted_label": "Tired/Sleepy",
  "confidence": 100.0,
  "processing_time": 2.43835,
  "timestamp": "2025-10-31T22:19:11.611586"
};

console.log('=== TESTING FORMAT FUNCTION ===');
console.log('Input:', JSON.stringify(testResponse, null, 2));

function getConfidenceLevel(confidence) {
  if (confidence >= 80) return 'High';
  if (confidence >= 50) return 'Medium';
  return 'Low';
}

function getRecommendation(label) {
  if (!label) return 'No recommendation available.';
  
  const recommendations = {
    'Hungry': 'The baby appears to be hungry. Try feeding them milk or formula.',
    'Tired/Sleepy': 'The baby seems tired and needs rest. Create a calm, quiet environment.',
    'Uncomfortable': 'The baby might be uncomfortable. Check if their diaper needs changing.',
    'Pain': 'The baby may be in pain or discomfort. Check for signs of gas or colic.',
    'Needs Attention': 'The baby wants your attention and comfort.',
  };
  
  for (const [key, recommendation] of Object.entries(recommendations)) {
    if (label.toLowerCase().includes(key.toLowerCase())) {
      return recommendation;
    }
  }
  
  return `The baby is showing signs of being ${label}. Respond with comfort and care.`;
}

function formatPredictionResponse(response) {
  if (response.predicted_label) {
    return {
      predicted_label: response.predicted_label,
      confidence: response.confidence,
      prediction_value: response.prediction_value,
      processing_time: response.processing_time,
      timestamp: response.timestamp,
      output: response.predicted_label,
      level: getConfidenceLevel(response.confidence || 0),
      recommendation: getRecommendation(response.predicted_label),
    };
  }
  
  return {
    output: response.output || response.prediction || 'Unknown',
    prediction: response.prediction || response.output || 'Unknown',
    level: response.level || 'Medium',
    recommendation: response.recommendation || 'No recommendation available.',
  };
}

const formatted = formatPredictionResponse(testResponse);
console.log('Output:', JSON.stringify(formatted, null, 2));

console.log('\n=== CHECKING REQUIRED FIELDS ===');
console.log('predicted_label:', formatted.predicted_label);
console.log('output:', formatted.output);
console.log('confidence:', formatted.confidence);
console.log('level:', formatted.level);
console.log('recommendation:', formatted.recommendation);

console.log('\n=== RESULT ===');
if (formatted.predicted_label && formatted.output && formatted.level && formatted.recommendation) {
  console.log('✅ All required fields present!');
  console.log('The formatted response should work in the UI');
} else {
  console.log('❌ Some fields are missing!');
  console.log('This might cause the UI not to render');
}
