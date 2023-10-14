const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const bcrypt = require('bcrypt');


const app = express();
const port = process.env.PORT || 3000;

main().catch((err) => console.log(err));
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/users');
    console.log('Data Base Connected!');
}
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname));

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
});


const feedbackSchema = new mongoose.Schema({
    name: String,
    email: String,
    teacherName: String,
    subjectName: String,
    comments: String,
});

const teacherSchema = new mongoose.Schema({
    id: Number,
    name: String,
    subject: String,
    email: String,
    phone: String,
    description: String,
})

const User = mongoose.model('User', userSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);
const Teachers = mongoose.model('Teachers', teacherSchema);



app.get('/add-teacher', (req, res) => {
    return res.redirect('AddTeacher.html');
})

app.get('/teachers', async (req, res) => {
    try {
        const teachers = await Teachers.find({});
        res.json(teachers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get('/teachers/:teacherId', async (req, res) => {
    const teacherId = req.params.teacherId;
    console.log(teacherId);

    try {
        const teacher = await Teachers.findOne({ id: teacherId }); // Corrected here

        if (!teacher) {
            res.status(404).json({ message: 'Teacher not found' });
        } else {
            console.log("Teacher ID:", teacherId);
            res.json(teacher);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.post('/add-teacher', async (req, res) => {
    try {
        const id = req.body.id;
        const name = req.body.name;
        const subject = req.body.subjectname;
        const email = req.body.email;
        const phone = req.body.phone;
        const description = req.body.description;

        const existingUser = await Teachers.findOne({ name, subject });

        if (existingUser) {
            return res.status(400).json({ message: 'User with the same first name and last name already exists' });
        }
        const teacher = new Teachers({
            id,
            name,
            subject,
            email,
            phone,
            description,
        });

        await teacher.save();
        return res.status(200).json({ message: 'Teacher Added successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while registering the user' });
    }
});


app.get('/', (req, res) => {
    res.set({
        "Allow-access-Allow-Origin": '*'
    })
    return res.redirect('signUp.html')
})
app.post('/submit-feedback', async (req, res) => {
    try {
        const feedbackData = req.body;
        const feedback = new Feedback({
            name: feedbackData.name,
            email: feedbackData.email,
            teacherName: feedbackData.Tname,
            subjectName: feedbackData.Sname,
            comments: feedbackData.comments,
        });

        // Save the feedback document to the database
        await feedback.save();
        res.status(200).json({ message: 'Feedback submitted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while submitting feedback' });
    }
});



app.post('/signup', async (req, res) => {
    try {
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const email = req.body.email;
        const plainPassword = req.body.password;

        const existingUser = await User.findOne({ firstName, lastName });

        if (existingUser) {
            return res.status(400).json({ message: 'User with the same first name and last name already exists' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

        // Create a new user with the hashed password
        const user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
        });

        await user.save();
        return res.status(200).json({ message: 'Sign Up successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while registering the user' });
    }
});




app.post('/login', async (req, res) => {
    try {
        const email = req.body.email;
        const plainPassword = req.body.password;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Compare the hashed password with the provided password
        const passwordMatch = await bcrypt.compare(plainPassword, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Send a success response with a redirect URL
        return res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while logging in' });
    }
});




app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});