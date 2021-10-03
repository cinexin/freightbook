const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Post = mongoose.model('Post')
const Comment = mongoose.model('Comment');

const maleNames = [
  "Jesse",
  "Liam",
  "Noah",
  "William",
  "James",
  "Oliver",
  "Benjamin",
  "Elijah",
  "Lucas",
  "Mason",
  "Logan",
  "Alexander",
  "Ethan",
  "Jacob",
  "Michael",
  "Daniel",
  "Henry",
  "Jackson",
  "Sebastian",
  "Aiden",
  "Matthew",
  "Samuel",
  "David",
  "Joseph",
  "Carter",
  "Owen",
  "Wyatt",
  "John",
  "Jack",
  "Luke",
  "Jayden",
  "Dylan",
  "Grayson",
  "Levi",
  "Isaac",
  "Gabriel",
  "Julian",
  "Mateo",
  "Anthony",
  "Jaxon",
  "Lincoln",
  "Joshua",
  "Christopher",
  "Andrew",
  "Theodore",
  "Caleb",
  "Ryan",
  "Asher",
  "Nathan",
  "Thomas",
  "Leo",
  "Isaiah",
  "Charles",
  "Josiah",
  "Hudson",
  "Christian",
  "Hunter",
  "Connor",
  "Eli",
  "Ezra",
  "Aaron",
  "Landon",
  "Adrian",
  "Jonathan",
  "Nolan",
  "Jeremiah",
  "Easton",
  "Elias",
  "Colton",
  "Cameron",
  "Carson",
  "Robert",
  "Angel",
  "Maverick",
  "Nicholas",
  "Dominic",
  "Jaxson",
  "Greyson",
  "Adam",
  "Ian",
  "Austin",
  "Santiago",
  "Jordan",
  "Cooper",
  "Brayden",
  "Roman",
  "Evan",
  "Ezekiel",
  "Xaviar",
  "Jose",
  "Jace",
  "Jameson",
  "Leonardo",
  "Axel",
  "Everett",
  "Kayden",
  "Miles",
  "Sawyer",
  "Jason",
];

const femaleNames = [
  "Jessie",
  "Emma",
  "Olivia",
  "Ava",
  "Isabella",
  "Sophia",
  "Charlotte",
  "Mia",
  "Amelia",
  "Harper",
  "Evelyn",
  "Abigail",
  "Emily",
  "Elizabeth",
  "Mila",
  "Ella",
  "Avery",
  "Sofia",
  "Camila",
  "Aria",
  "Scarlett",
  "Victoria",
  "Madison",
  "Luna",
  "Grace",
  "Chloe",
  "Penelope",
  "Layla",
  "Riley",
  "Zoey",
  "Nora",
  "Lily",
  "Eleanor",
  "Hannah",
  "Lillian",
  "Addison",
  "Aubrey",
  "Ellie",
  "Stella",
  "Natalie",
  "Zoe",
  "Leah",
  "Hazel",
  "Violet",
  "Aurora",
  "Savannah",
  "Audrey",
  "Brooklyn",
  "Bella",
  "Claire",
  "Skylar",
  "Lucy",
  "Paisley",
  "Everly",
  "Anna",
  "Caroline",
  "Nova",
  "Genesis",
  "Emilia",
  "Kennedy",
  "Samantha",
  "Maya",
  "Willow",
  "Kinsley",
  "Naomi",
  "Aaliyah",
  "Elena",
  "Sarah",
  "Ariana",
  "Allison",
  "Gabriella",
  "Alice",
  "Madelyn",
  "Cora",
  "Ruby",
  "Eva",
  "Serenity",
  "Autumn",
  "Adeline",
  "Hailey",
  "Gianna",
  "Valentina",
  "Isla",
  "Eliana",
  "Quinn",
  "Nevaeh",
  "Ivy",
  "Sadie",
  "Piper",
  "Lydia",
  "Alexa",
  "Josephine",
  "Emery",
  "Julia",
  "Delilah",
  "Arianna",
  "Vivian",
  "Kaylee",
  "Sophie",
  "Brielle",
  "Madeline",
];

const familyNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Jones",
  "Brown",
  "Davis",
  "Miller",
  "Wilson",
  "Moore",
  "Taylor",
  "Anderson",
  "Thomas",
  "Jackson",
  "White",
  "Harris",
  "Martin",
  "Thompson",
  "Garcia",
  "Martinez",
  "Robinson",
  "Clark",
  "Rodriguez",
  "Lewis",
  "Lee",
  "Walker",
  "Hall",
  "Allen",
  "Young",
  "Hernandez",
  "King",
  "Wright",
  "Lopez",
  "Hill",
  "Scott",
  "Green",
  "Adams",
  "Baker",
  "Gonzalez",
  "Nelson",
  "Carter",
  "Mitchell",
  "Perez",
  "Roberts",
  "Turner",
  "Phillips",
  "Campbell",
  "Parker",
  "Evans",
  "Edwards",
  "Collins",
  "Stewart",
  "Sanchez",
  "Morris",
  "Rogers",
  "Reed",
  "Cook",
  "Morgan",
  "Bell",
  "Murphy",
  "Bailey",
  "Rivera",
  "Cooper",
  "Richardson",
  "Cox",
  "Howard",
  "Ward",
  "Torres",
  "Peterson",
  "Gray",
  "Ramirez",
  "James",
  "Watson",
  "Brooks",
  "Kelly",
  "Sanders",
  "Price",
  "Bennett",
  "Wood",
  "Barnes",
  "Ross",
  "Henderson",
  "Coleman",
  "Jenkins",
  "Perry",
  "Powell",
  "Long",
  "Patterson",
  "Hughes",
  "Flores",
  "Washington",
  "Butler",
  "Simmons",
  "Foster",
  "Gonzales",
  "Bryant",
  "Alexander",
  "Ussell",
  "Griffin",
  "Diaz",
  "Hayes",
];

const getRandom = (min, max) => {
  return Math.floor(Math.random() * (max - min) ) + min;
}


const registerFakeUser = (gender, email) => {

  let firstName;
  // Checks if you should use a female name or male name.
  if(gender == "f") {
    firstName = femaleNames[getRandom(0, femaleNames.length - 1)];
  } else {
    firstName = maleNames[getRandom(0, maleNames.length - 1)];
  }

  // The last name is independent of the users gender.
  let lastName = familyNames[getRandom(0, familyNames.length - 1)];

  // This function will return a promise.  The promise gets resolved when the user is saved successfully.
  return new Promise(function(resolve, reject) {

    // Create the user user
    let user = new User();
    user.name = firstName + " " + lastName;
    user.email = email;

    // The email follows the same pattern as the name of the images I am using.  That's why I'm setting the profile_image to the, "email".
    user.profile_image = email;

    // All users have the same password, "f".  It will allow us to log into any account we want.
    user.setPassword("password");

    //user = createFakePosts(user, getRandom(8, 16));

    user.save((err, user) => {
      if(err) { reject(); return res.json({err: err}) }
      resolve(user);
    });
  });
}

const createFakeUsers = (req, res) => {
  // This function will create 70 new users.
  // It will be calling the registerFakeUser function above.
  // This function is called AFTER we delete all users, see code below.
  function create70Users() {
    function create35Users(gender) {
      for (let i = 0; i < 35; i++) {
        let promise = new Promise(function (resolve, reject) {
          registerFakeUser(gender, `${gender}${i + 1}`).then((val) => {
            resolve(val);
          });
        });
        promises.push(promise);
      }
    }

    let promises = [];
    create35Users("f");
    create35Users("m");

    return new Promise(function (resolve, reject) {
      Promise.all(promises).then((val) => {
        resolve(val);
      });
    });
    res.statusJson(201, {message: 'Fake users created'})
  }

  // Before creating users, let's delete the current users.
  let deleteUsers = new Promise(function(resolve, reject) {
    User.deleteMany({ }, (err, info) => {
      if(err) { reject(info); return res.send({ error: err }) }
      resolve(info);
    });
  });


  deleteUsers.then((val) => {
    create70Users().then((val) => {
      //makeFriends(val).then((val) => {
        console.log("Done making friends, sending back response");
        res.statusJson(201, { message: "Created Fake Users" });
      });
    //});
  });
}

module.exports = {
  createFakeUsers
}

