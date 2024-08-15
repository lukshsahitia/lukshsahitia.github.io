const express = require('express');
const router = express.Router();
const dbo = require("../db/conn");
const { ObjectId } = require('mongodb');

// Route to select a random word
router.route('/randomWord').get(async (req, res) => {
    try {
        const dbConnect = dbo.getDb();
        const collection = dbConnect.collection("Words");

        //To make guessing easier, if the word is longer than 8 letters it will repick the word
        const randomWords = await collection.aggregate([
            { $match: { $expr: { $lte: [{ $strLenCP: "$word" }, 8] } } },
            { $sample: { size: 1 } }
        ]).toArray();
        
        if (randomWords.length === 0) {
            throw new Error("No words found");
        }

        res.json({ word: randomWords[0].word });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to display random word based on discovered letters
router.route('/discoveredWord/:id').get(async (req, res) => {
    try {
        const dbConnect = dbo.getDb();
        const collectionWords = dbConnect.collection("Words");
        const collectionLetters = dbConnect.collection("Letters");

        const wordDoc = await collectionWords.findOne({ _id: new ObjectId(req.params.id) });
        if (!wordDoc) {
            return res.status(404).json({ error: "Word not found" });
        }

        const word = wordDoc.word.toLowerCase();
        const correctLetters = await collectionLetters.find({ inWord: true }).toArray();
        const correctLettersArray = correctLetters.map(doc => doc.letter.toLowerCase());

        let currWord = '';
        for (let i = 0; i < word.length; i++) {
            currWord += correctLettersArray.includes(word[i]) ? word[i] : '_';
        }

        res.json({ currWord });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to display all correct letters
router.route('/correctLetters').get(async (req, res) => {
    try {
        const dbConnect = dbo.getDb();
        const collection = dbConnect.collection("Letters");

        const correctLetters = await collection.find({ inWord: true }).toArray();
        const correctLettersArray = correctLetters.map(doc => doc.letter);

        res.json({ letters: correctLettersArray });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to count all incorrect guesses
router.route('/incorrectLetters').get(async (req, res) => {
    try {
        const dbConnect = dbo.getDb();
        const collection = dbConnect.collection("Letters");

        const incorrectLetters = await collection.find({ inWord: false }).toArray();
        const incorrectLettersArray = incorrectLetters.map(doc => doc.letter);

        res.json({ letters: incorrectLettersArray });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to add letter to letter collection
router.route('/addLetter/:id').post(async (req, res) => {
    try {
        const dbConnect = dbo.getDb();
        const collectionWords = dbConnect.collection("Words");
        const collectionLetters = dbConnect.collection("Letters");

        const letter = req.body.letter.toLowerCase();
        let inWord = false;

        const word = await collectionWords.findOne({ _id: new ObjectId(req.params.id) });

        if (letter.length !== 1 || !/^[a-zA-Z]$/.test(letter)) {
            return res.status(404).json({ error: `Invalid letter ${letter}` });
        }

        const existingLetter = await collectionLetters.findOne({ letter });
        if (existingLetter) {
            return res.status(400).json({ error: `Letter ${letter} is already in the collection.` });
        }

        if (!word) {
            return res.status(404).json({ error: "Word not found" });
        }

        inWord = word.word.toLowerCase().includes(letter);

        const letterDoc = { letter, inWord };
        await collectionLetters.insertOne(letterDoc);

        res.json({ letter, inWord });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to delete all letters in letter collection
router.route('/deleteLetters').delete(async (req, res) => {
    try {
        const dbConnect = dbo.getDb();
        const collection = dbConnect.collection("Letters");

        const result = await collection.deleteMany({});
        res.json({ message: `All letters have been deleted (deleted documents: ${result.deletedCount})` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to find a player by ID
router.route('/findPlayer/:id').get(async (req, res) => {
    try {
        const dbConnect = dbo.getDb();
        const collection = dbConnect.collection("Players");

        const player = await collection.findOne({ _id: new ObjectId(req.params.id) });

        if (!player) {
            return res.status(404).json({ error: 'Player not found.' });
        }

        res.json(player);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to add a single player
router.route('/addPlayer').post(async (req, res) => {
    try {
        const dbConnect = dbo.getDb();
        const collection = dbConnect.collection("Players");

        const { player, score } = req.body;

        if (!player || typeof player !== 'string' || typeof score !== 'number') {
            return res.status(400).json({ error: 'Invalid input. Ensure player is a string and score is a number.' });
        }

        await collection.insertOne({ player, score });
        res.json({ message: `Player ${player} with a score of ${score} was added successfully.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to delete all players
router.route('/deletePlayers').delete(async (req, res) => {
    try {
        const dbConnect = dbo.getDb();
        const collection = dbConnect.collection("Players");

        const result = await collection.deleteMany({});
        res.json({ message: `All players have been deleted (deleted documents: ${result.deletedCount})` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to add a single word
router.route('/addWord').post(async (req, res) => {
    try {
        const dbConnect = dbo.getDb();
        const collection = dbConnect.collection("Words");

        const newWord = req.body.word;

        if (!newWord || typeof newWord !== 'string') {
            return res.status(400).json({ error: 'Invalid word format' });
        }

        await collection.insertOne({ word: newWord });
        res.json({ message: `"${newWord}" was added successfully` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to add a list of words
//<<<<<<< HEAD
/* Sample list json (287 words): { 
    "words": [
        "Apple", "Banjo", "Circus", "Dragon", "Elephant", "Falcon", "Garden", "Hammer", "Igloo", "Jigsaw",
        "Kettle", "Lantern", "Mountain", "Nestle", "Octopus", "Penguin", "Quilt", "Rainbow", "Sailor", "Tiger",
        "Umbrella", "Vortex", "Window", "Xylophone", "Yacht", "Zebra", "Almond", "Breeze", "Candle", "Dancer",
        "Echo", "Forest", "Guitar", "Hero", "Island", "Jewel", "Kite", "Ladder", "Magic", "Nutmeg",
        "Orbit", "Piano", "Quest", "Rocket", "Sunflower", "Turtle", "Universe", "Volcano", "Whisper", "Yarn",
        "Zephyr", "Abstract", "Basket", "Chocolate", "Dolphin", "Envelope", "Flamingo", "Granite", "Hummingbird",
        "Iceberg", "Jellyfish", "Kingdom", "Lizard", "Moonlight", "Necklace", "Opera", "Parrot", "Quill", "Sculpture",
        "Trampoline", "Vase", "Watch", "Zigzag", "Adventure", "Bridge", "Cloud", "Dragonfly", "Earthquake",
        "Fireworks", "Gardenia", "Harmony", "Insect", "Jaguar", "Kaleidoscope", "Lighthouse", "Magnet", "Nimbus",
        "Oasis", "Quasar", "Sandcastle", "Telescope", "Unicorn", "Violin", "Whistle", "Acrobat", "Buffalo",
        "Diamond", "Glacier", "Horizon", "Icecream", "Jungle", "Marshmallow", "Nightingale", "Olive", "Pudding",
        "Quicksand", "Rose", "Sapphire", "Triangle", "Velvet", "Waterfall", "Zeppelin", "Algebra", "Bakery",
        "Capsule", "Drama", "Emerald", "Firefly", "Galaxy", "Invention", "Library", "Meadow", "Neon", "Orchestra",
        "Pail", "Radio", "Starfish", "Tunnel", "Aeroplane", "Balloon", "Dandelion", "Frogs", "Jeep", "Muffin",
        "Network", "Octagon", "Pancake", "Quiver", "Snowflake", "Treasure", "Water", "Xenon", "Zenith", "Artisan",
        "Blossom", "Castle", "Dinosaur", "Engine", "Fairy", "Giraffe", "Honey", "Joy", "Koala", "Lemon", "Moon",
        "Night", "Safari", "Xerox", "Zucchini", "Atlas", "Blueberry", "Carousel", "Grapefruit", "Heatwave", "Icicle",
        "Kale", "Melon", "Noodle", "Orange", "Prism", "Robot", "Scarf", "Underwater", "Yogurt", "Yawn", "Zipper",
        "Antique", "Bedrock", "Chandelier", "Foliage", "Gorilla", "Jasmine", "Marble", "Nightfall", "Pail", "River",
        "Sun", "Taffy", "Urban", "Veil", "Waffle", "Yellow", "Anglerfish", "Breeze", "Cricket", "Den", "Embrace",
        "Flannel", "Hibiscus", "Indigo", "Koi", "Maple", "Noodles", "Owl", "Quiche", "Raven", "Seahorse", "Tide",
        "Violets", "Willow", "Yogurt", "Anemone", "Bonfire", "Coral", "Evergreen", "Glimpse", "Honeydew", "Ivory",
        "Jukebox", "Mouse", "Nebula", "Opal", "Snowman", "Yodel", "Zephyr", "Architecture", "Bouquet", "Compass",
        "Drizzle", "Emu", "Fox", "Grizzly", "Hammock", "Lullaby", "Mocha", "Nomad", "Pomegranate", "Ripple",
        "Seashell", "Tapestry", "Vapor", "Wisteria", "Zinnia", "Celery", "Fig", "Ink", "Jellybean", "Lavender",
        "Mango", "Nucleus", "Quicksilver", "Silver", "Tulip", "Vulture", "Yawn", "Yoke", "Grape", "Honeycomb",
        "Ignition", "Joy", "Lively", "Peony", "Rosebud", "Sky", "Tranquility", "Windmill", "Yarn", "Zephyr",
        "Albatross", "Bubble", "Crescent", "Fiesta", "Gold", "Hummingbird", "Inkwell", "Jade", "Knapsack",
        "Paintbrush", "Quokka", "Sunset", "Wombat", "Yellow", "Anglerfish", "Breeze", "Cricket", "Den"

    I DELETED the words from above and added these words below -Blake. There are now 1000 words in the db     
     ------------100 A's----------------
    {
        "words": ["Advertisement", "Apprehension", "Artisan", "Analyst", "Armory", "Alteration", "Abstinence", "Assessment", "Acrimony", "Allocation", "Agility", "Allotment", "Arithmetic", "Absolution", "Antagonist", "Archetype", "Apothecary", "Ant", "Abundance", "Attendance", "Arson", "Altitude", "Artichoke", "Autism", "Attraction", "Armor", "Accuracy", "Adjudication", "Arrow", "Aqueduct", "Agreement", "Adjustment", "Assumption", "Autonomy", "Admirer", "Anthem", "Agriculture", "Antidote", "Athletics", "Ablution", "Avian", "Ascendancy", "Acerbic", "Abduction", "Attribute", "Apology", "Adversity", "Archive", "Amnesty", "Addiction", "Accretion", "Ammunition", "Assertion", "Alchemy", "Angelfish", "Attachment", "Agitation", "Association", "Adulthood", "Ark", "Application", "Aardwolf", "Aura", "Acceleration", "Aborigine", "Armchair", "Agoraphobia", "Artist", "Abrasion", "Apex", "Affliction", "Academician", "Armament", "Applause", "Apple", "Azure", "Affection", "Abolishment", "Avenue", "Aurora", "Affinity", "Arctic", "Ancestor", "Antarctica", "Appreciation", "Anniversary", "Actuator", "Albatross", "Asteroid", "Archery", "Avalanche", "Acquaintance", "Atom", "Algebra", "Academia", "Aversion", "Asset", "Antelope", "Acorn", "Ability"]
    }

     ------------100 B's----------------
    {
        "words": ["Byword", "Bachelor", "Boldness", "Bronze", "Bargain", "Bazaar", "Barracks", "Beauty", "Bonanza", "Beanstalk", "Bilge", "Bright", "Beehive", "Basement", "Brotherhood", "Boutique", "Bravery", "Balloon", "Baptism", "Belt", "Bloodstream", "Blizzard", "Bacteria", "Balcony", "Beach", "Barefoot", "Bulldog", "Basket", "Bushel", "Burger", "Buckle", "Bounty", "Brigade", "Brownie", "Bell", "Blade", "Bandage", "Bandana", "Boiler", "Bailiff", "Badger", "Berry", "Boulder", "Boxer", "Butterfly", "Butcher", "Beetle", "Bikini", "Broccoli", "Baboon", "Blasphemy", "Barnacle", "Breath", "Boat", "Bonfire", "Barbecue", "Breakdown", "Beverage", "Bumper", "Bureau", "Blueprint", "Bunk", "Ballad", "Biscuit", "Brook", "Bamboo", "Bobsled", "Baggage", "Bullet", "Brightness", "Branch", "Bend", "Bleach", "Brawl", "Bogeyman", "Burst", "Bagel", "Burrow", "Boomerang", "Banshee", "Blaze", "Brink", "Bloom", "Bundle", "Bombardment", "Bracelet", "Buffalo", "Bidder", "Bud", "Bishop", "Bully", "Beagle", "Bedbug", "Biography", "Bugle", "Betrayal", "Bookstore", "Border", "Beast", "Belonging"]
    }

    ------------100 c's----------------
    {
        "words": ["Cabin", "Cable", "Cactus", "Cafeteria", "Cage", "Cake", "Calculator", "Calendar", "Camera", "Camp", "Canal", "Candle", "Candy", "Canoe", "Canvas", "Canyon", "Cap", "Cape", "Capital", "Captain", "Caravan", "Carbon", "Card", "Cardboard", "Carnival", "Carpet", "Carriage", "Cart", "Cartoon", "Carving", "Cascade", "Case", "Cash", "Casket", "Castle", "Cat", "Catalyst", "Cathedral", "Cattle", "Cauldron", "Cave", "Ceiling", "Celery", "Cell", "Cellar", "Cement", "Cemetery", "Center", "Century", "Ceremony", "Chalk", "Chamber", "Champion", "Chandelier", "Change", "Channel", "Chaos", "Chapel", "Chapter", "Character", "Charcoal", "Charge", "Chariot", "Charity", "Charm", "Chart", "Chase", "Chasm", "Chateau", "Check", "Cheek", "Cheese", "Chemical", "Cherry", "Chess", "Chest", "Chicken", "Chief", "Child", "Chime", "Chin", "Chip", "Chocolate", "Choice", "Chord", "Cider", "Cigar", "Cinema", "Circle", "Circus", "City", "Clam", "Clarinet", "Clash", "Clasp", "Class", "Claw", "Clay", "Cleaner", "Clerk"]
    }
    
    ------------100 d's----------------
    {
        "words": ["Donate","Delay","Deer","Disorder","Deck","Degree","Deliver","Door","Division","Dinner","Defeat","Dagger","Defend","Decision","Data","Discover","Deceit","Debt","Deposit","Device","Detail","Daisy","Detention","Dinosaur","Diverse","Deny","Devil","Dedicate","Distress","Drama","Dice","Dragon","Doubt","District","Dignity","Dare","Dominate","Desire","Detect","Dollar","Deep","Demon","Diamond","Dementia","Divide","Demand","Document","Donkey","Dismiss","Diploma","Direct","Display","December","Day","Develop","Despair","Digest","Dog","Diet","Decide","Destroy","Draft","Depart","Damage","Danger","Disaster","Declare","Delete","Depress","Daughter","Disappear","Digital","Dish","Deal","Divorce","Distribute","Den","Desert","Distract","Drape","Dandelion","Dial","Decade","Decrease","Decay","Doll","Deaf","Distinct","Distance","Disease","Darkness","Depth","Defense","Determine","Diagram","Decline","Dawn","Debate","Differ","Dimension"]
    }

    ------------100 f's----------------
    {
        "words": ["Fabric", "Facade", "Face", "Facilitate", "Factor", "Factory", "Faculty", "Fade", "Fail", "Faint", "Fair", "Fairy", "Faith", "Fall", "False", "Fame", "Family", "Famine", "Famous", "Fan", "Fancy", "Fantasy", "Farm", "Farmer", "Fashion", "Fast", "Fat", "Fate", "Father", "Fault", "Favor", "Fawn", "Fear", "Feast", "Feat", "Feather", "Feature", "February", "Federal", "Fee", "Feed", "Feel", "Fellow", "Female", "Fence", "Festival", "Fetch", "Fever", "Few", "Fiber", "Fiction", "Field", "Fiery", "Fight", "Figure", "File", "Fill", "Film", "Filter", "Final", "Finance", "Find", "Fine", "Finger", "Finish", "Fire", "Firm", "First", "Fish", "Fisher", "Fist", "Fit", "Fitness", "Fix", "Flag", "Flame", "Flash", "Flat", "Flavor", "Fleet", "Flesh", "Flight", "Flip", "Float", "Flood", "Floor", "Flour", "Flow", "Flower", "Fluid", "Flu", "Fluctuate", "Fluency", "Fly", "Foam", "Focus", "Fog", "Fold", "Folk", "Follow", "Food", "Fool", "Foot", "Football", "Force", "Forecast", "Forest", "Forestry", "Forget", "Forgive", "Fork", "Form", "Formal", "Format", "Former", "Fort", "Fortress", "Fortune", "Forum", "Forward"]
    }

    ------------100 g's----------------
    {
        "words": ["Genius", "Grid", "General", "Goose", "Gather", "Gist", "Going", "Ghost", "Gamble", "Garden", "Guru", "Genetics", "Glass", "Geometry", "Gnarled", "Graduate", "Garbage", "Glacier", "Germ", "Grace", "Gnaw", "Goal", "Glance", "Gnome", "Geyser", "Glimmer", "Gear", "Genie", "Gleam", "Giraffe", "Gladiator", "Grief", "Gravity", "Giraffe", "Governor", "Gloss", "Goat", "Green", "Great", "Guild", "Gown", "Grain", "Globe", "Glitter", "Grit", "Galaxy", "Glen", "Glow", "Giant", "Gratitude", "Gopher", "Giant", "Gazelle", "Glove", "Gingham", "Gallery", "Gypsy", "Gospel", "Glisten", "Growth", "Gadget", "Gala", "Gauge", "Gentle", "Goblin", "Gift", "Glory", "Gun", "Gesture", "God", "Godly", "Give", "Grammar", "Grand", "Gossip", "Glue", "Glaze", "Gloom", "Graph", "Guilt", "Gondola", "Geology", "Glide", "Gate", "Gyrate", "Greed", "Gorilla", "Glutton", "Gnash", "Guest", "Gong", "Gull", "Gag", "Grape", "Gloat", "Guard", "Ground", "Gallon", "Gale", "Glare"]
    }

    ------------100 h's----------------
    {
        "words": ["Habitat", "Hack", "Hacker", "Hail", "Hair", "Half", "Halftime", "Hall", "Hallway", "Halo", "Ham", "Hammer", "Hamper", "Hand", "Handle", "Handwriting", "Hangar", "Hanger", "Harbor", "Hard", "Hardcore", "Hardcover", "Hardship", "Hardware", "Hare", "Harm", "Harmony", "Harp", "Harvest", "Hat", "Hatch", "Hate", "Haul", "Haunt", "Haven", "Havoc", "Hawk", "Hay", "Hazard", "Hazel", "Head", "Headline", "Headquarters", "Headset", "Health", "Heart", "Heater", "Heaven", "Hedge", "Height", "Helicopter", "Hell", "Hello", "Helmet", "Helper", "Hemisphere", "Herb", "Heritage", "Hero", "Heron", "Hesitate", "Hexagon", "Hiccup", "Hidden", "Hide", "Hierarchy", "High", "Highland", "Highlight", "Highway", "Hill", "Himself", "Hinge", "Hint", "Hip", "Hippie", "Hiss", "History", "Hitch", "Hive", "Hobby", "Hockey", "Hog", "Holiday", "Hollow", "Home", "Homework", "Honest", "Honey", "Hood", "Hook", "Hope", "Horizon", "Horn", "Horror", "Horse", "Hospital", "Host", "Hotel", "Hour", "House", "Housing", "Hovel", "Hover", "Howl", "Hug", "Huge", "Human", "Humidity", "Humor"]
    }

    ------------100 k's----------------
    {
        "words":["Kevlar","Kilter","Knight","Kindness","Kitten","Keen","Kangaroo","Kidney","Kayak","Kick","Kidnap","Kin","Krypton","Knapsack","Kendo","Kelp","Kale","Knot","Kneepad","Kindle","Kazoo","Kennel","Kimono","Kang","Karate","Kebab","Kitchen","Kiwi","Karma","Kismet","Knuckle","Kungfu","Knee","Kibosh","Kernel","Knife","King","Kibbutz","Kinship","Kickbox","Kava","Karst","Krypton","Knockout","Katydid","Kaleidoscope","Kungfu","Knee","Kite","Koumiss","Kingpin","Kapok","Kudos","Kosher","Khaki","Kraal","Karaoke","Kilogram","Knob","Kybosh","Karyotype","Koala","Keg","Karabiner","Kangaroo","Koi","Kingfisher","Kleptomania","Ketchup","Kumquat","Kiosk","Kilometer","Kinetic","Kookaburra","Knot","Kudos","Ketchup","Keepsake","Key","Kiteboard","Knotty","Kamikaze","Kinky","Kettle","Kasha","Kant","Knowledge","Ken","Knighthood","Kingdom","Koala","Kite","Kneejerk","Kurbash","Kebab","Kaiser","Kidney","Knitting","Kudos","Keepsake"]
    }

    ------------100 l's----------------
    {
        "words": ["Lens", "Lump", "Loyal", "Lung", "Legislation", "Linoleum", "Lampoon", "Lordship", "Land", "Load", "Log", "Lagoon", "License", "Lecture", "Locust", "Liquid", "Laud", "Leather", "Lupine", "Lopsided", "Logic", "Lass", "Listener", "Lava", "Labor", "Legend", "Liberty", "Lawn", "Line", "Lost", "Lifetime", "Labour", "Latch", "Llama", "Lab", "Lace", "Leeway", "League", "Leisure", "Legislature", "Love", "Luminous", "Library", "Locale", "Long", "Linguist", "Lottery", "Lilac", "Last", "Loaner", "Lock", "Lumber", "Lawsuit", "Liftoff", "Lie", "List", "Lousy", "Lucid", "Legacy", "Location", "Lodging", "Lark", "Lender", "Librarian", "Leafy", "Leader", "Luncheon", "Laptop", "Learning", "Lightning", "Lattice", "Likewise", "Lumberjack", "Lemon", "Look", "Letterbox", "Lime", "Liger", "Level", "Leap", "Lure", "Lollipop", "Lust", "Lowland", "Loose", "Livestock", "Lush", "Limit", "Limelight", "Lean", "Liveliness", "Lunch", "Layer", "Lull", "Leopard", "Loan", "Lap", "Lesion", "Lunchbox"]
    }

    ------------100 m's----------------
    {
        "words": ["Mail", "Metronome", "Mesh", "Moon", "Marine", "Mosaic", "More", "Mango", "Monster", "Mission", "Medal", "Midnight", "Mansion", "Mud", "Mile", "Medicine", "Mixer", "Mercury", "Margin", "Measure", "Manager", "Modest", "Music", "Madness", "Mirror", "Moment", "Meaning", "Master", "Magnet", "Maximum", "Matter", "Mob", "Meditation", "Mouse", "Melody", "Meeting", "Maniac", "Match", "Mine", "Monarch", "Modern", "Mill", "Museum", "Message", "Miracle", "Media", "Member", "Mechanic", "Morning", "Map", "Mixture", "Monitor", "Mammal", "Motor", "Mountain", "Model", "Meat", "Meadow", "Maiden", "March", "Marathon", "Money", "Mite", "Minister", "Module", "Mind", "Medium", "Meal", "Move", "Mass", "Migrant", "Mature", "Mistake", "Mood", "Matrix", "Mist", "Machine", "Marsh", "Mineral", "Mandate", "Major", "Mentor", "Mask", "Merit", "Metal", "Material", "Manor", "Martian", "Method", "Memory", "Mouth", "Milk", "Motel", "Market", "Mosquito", "Minute", "Medieval", "Month", "Movie", "Marble"]
    }

    ------------100 n's----------------
    {
        "words": ["Napkin", "North", "Nourishment", "Nurturing", "Nonsense", "Nuclear", "Nervous", "Necessity", "Novelty", "Newspaper", "Neutralize", "Neutrality", "Nebula", "Numerator", "Nature", "Nectar", "Notice", "Nasty", "Name", "Nucleus", "Nutrition", "Nifty", "Nickname", "Nightmare", "Nation", "Nail", "Notable", "Nobility", "Nylon", "Nymph", "Neighborly", "Nonfiction", "Nineteen", "Nostalgia", "Notebook", "Novel", "Nimbus", "Nutrient", "Ninja", "Notification", "Navy", "Narrow", "Niche", "Ninety", "Natal", "Norm", "Nightfall", "Neglect", "Night", "Numeral", "Navel", "Nutmeg", "Navigate", "Nominee", "Nest", "Narrative", "Neon", "Nostalgic", "Nurture", "Needle", "Noise", "Number", "Normal", "Ninth", "Nightingale", "Noodle", "Nostrum", "Nuzzle", "Negotiation", "Nourish", "Neutral", "Notion", "Normality", "Nyctalopia", "Noteworthy", "Neighbor", "Norwegian", "Nasal", "Nitrogen", "Nugget", "Newton", "Newborn", "Nonchalant", "Narrator", "Nomad", "Network", "Nutcracker", "Nationwide", "Noon", "Necrosis", "Negative", "Nephew", "Nurse", "Necklace", "Noble", "Navigator", "Nonprofit", "Nerve", "Neighborhood", "Neat"]
    }



    

// */
// =======
// >>>>>>> 4531d915bbe5c0987183ec5354f56b53ef09ae84
router.route('/addList').post(async (req, res) => {
    try {
        const dbConnect = dbo.getDb();
        const collection = dbConnect.collection("Words");

        const newWords = req.body.words;

        if (!Array.isArray(newWords)) {
            return res.status(400).json({ error: "Words should be an array" });
        }

        const wordDocs = newWords.map(word => ({ word }));
        const result = await collection.insertMany(wordDocs);
        res.json({ message: `All words have been added (added documents: ${result.insertedCount})` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to delete a single word
router.route('/deleteWord/:id').delete(async (req, res) => {
    try {
        const dbConnect = dbo.getDb();
        const collection = dbConnect.collection("Words");

        const wordId = req.params.id;
        const word = await collection.findOne({ _id: new ObjectId(wordId) });

        if (!word) {
            return res.status(404).json({ error: "Word not found" });
        }

        await collection.deleteOne({ _id: new ObjectId(wordId) });
        res.json({ message: `${word.word} was deleted successfully` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to delete all words
router.route('/deleteWords').delete(async (req, res) => {
    try {
        const dbConnect = dbo.getDb();
        const collection = dbConnect.collection("Words");

        const result = await collection.deleteMany({});
        res.json({ message: `All words have been deleted (deleted documents: ${result.deletedCount})` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;