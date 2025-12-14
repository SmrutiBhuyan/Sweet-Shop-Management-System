/**
 * Environment configuration and validation
 * This ensures all required environment variables are set
 */

const validateEnvironment = () =>{
    const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'PORT'];
    const missingVars = requiredEnvVars.filter(varname => !process.env[varname]);

    if(missingVars > 0) {
        console.error('❌ Missing required environment variables:');
        missingVars.forEach(varName => {
             console.error(`   - ${varName}`);
        });
    console.error('\nPlease check your .env file or set these variables.');
    process.exit(1);
    }

     // Validate MongoDB URI
     if(!process.env.MONGODB_URI.includes('mongodb')){
        console.error('❌ Invalid MONGODB_URI. Should start with mongodb:// or mongodb+srv://');
     process.exit(1);
     }

       // Validate PORT
       const port = parseInt(process.env.PORT);
       if(isNaN(port) || port<1 || port > 65535){
           console.error(`❌ Invalid PORT: ${process.env.PORT}. Must be between 1-65535`);
        process.exit(1);
       }
        console.log('✅ Environment variables validated successfully');
}

module.exports = {validateEnvironment};