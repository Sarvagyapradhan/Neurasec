/**
 * This file tests if the dependencies are working correctly
 */
import axios from 'axios';
import whoisJson from 'whois-json';
import checkDomain from 'ssl-checker';

async function testDependencies() {
  console.log("Testing axios...");
  try {
    await axios.get('https://www.example.com');
    console.log("✅ Axios working");
  } catch (error) {
    console.error("❌ Axios error:", error);
  }

  console.log("Testing whois-json...");
  try {
    await whoisJson('example.com');
    console.log("✅ whois-json working");
  } catch (error) {
    console.error("❌ whois-json error:", error);
  }

  console.log("Testing ssl-checker...");
  try {
    await checkDomain('example.com');
    console.log("✅ ssl-checker working");
  } catch (error) {
    console.error("❌ ssl-checker error:", error);
  }
  
  return {
    message: "Dependencies test completed"
  };
}

// If this file is run directly
if (require.main === module) {
  testDependencies().catch(console.error);
}

export default testDependencies; 