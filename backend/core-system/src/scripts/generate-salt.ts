import crypto from 'crypto';

function generateSalt(): string {
  return crypto.randomBytes(32).toString('hex');
}

const salt = generateSalt();
console.log('\n✅ HASH_SALT generated successfully!\n');
console.log('Add this line to your .env file:');
console.log(`HASH_SALT=${salt}\n`);
