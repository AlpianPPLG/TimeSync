import bcrypt from "bcryptjs"

// Script to generate bcrypt hash for testing
const password = "12345"
const saltRounds = 10

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error("Error hashing password:", err)
  } else {
    console.log("Password:", password)
    console.log("Hash:", hash)
    console.log("\nYou can use this hash in your database:")
    console.log(`'${hash}'`)
  }
})

// Also verify the hash works
const testHash = "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi"
bcrypt.compare(password, testHash, (err, result) => {
  if (err) {
    console.error("Error comparing password:", err)
  } else {
    console.log("\nPassword verification test:")
    console.log("Password matches hash:", result)
  }
})
