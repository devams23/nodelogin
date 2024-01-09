import LocalStrategy from "passport-local";
import bcrypt from "bcrypt";
import pg from "pg";


const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "nodelogin",
    password: "devam",
    port: 5432,
  });
  db.connect();


 
  export function initialized(passport) {
   console.log('oyy thai gyu');
//////////////////////////////////////////////////////////////////////////////////////////////////////////|
    const authenticateUser = async (loginUsername, loginPassword, done) => {                            //|
      console.log("oyyyyy")                                                                             //|
      try {                                                                                             //|
        const results = await db.query('SELECT * FROM users WHERE username = $1', [loginUsername]);     //|
        console.log(results.rows);                                                                      //|                                     
        if (results.rows.length > 0) {                                                                  //|
          const user = results.rows[0];                                                                 //|
          const isMatch = await bcrypt.compare(loginPassword, user.password);                           //|                                                                                                       
          if (isMatch) {                                                                                //|
            return done(null, user);                                                                    //|      
          } else {                                                                                      //|
            return done(null, false, { message: 'Password is incorrect' });                             //|
          }                                                                                             //|
        } else {                                                                                        //|
          return done(null, false, { message: 'No user with that username' });                          //|
        }                                                                                               //|
      } catch (err) {                                                                                   //|
        return done(err);                                                                               //|
      }                                                                                                 //|
    };                                                                                                  //|
//////////////////////////////////////////////////////////////////////////////////////////////////////////|
    passport.use(
      new LocalStrategy(
        { usernameField: 'loginUsername', passwordField: 'loginPassword' },
        authenticateUser
      )
    );
  
    passport.serializeUser((user, done) => done(null, user.id));
  
    passport.deserializeUser( async (id, done) => {
    db.query('SELECT * FROM users WHERE id = $1', [id], (err, results) => {
        if (err) {
          return done(err);
        }
        console.log(`ID is ${results.rows[0].id}`);
        return done(null, results.rows[0]);
      });
    });
  }
  
  export default initialized;
  