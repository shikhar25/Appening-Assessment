require('dotenv').config()

const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')

app.use(express.json())

const posts = [
    {
        username: 'Shikhar',
        title: 'Post 1'
    },
    {
        username: 'Divyanshu',
        title: 'Post 2'
    }
]

let refreshTokens = []

let users = [
    {
        name: "Nitin",
        role: "admin",
        password: "hash1usingpasscodejs",
        title: "Post3" 
    },
    {
        name: "Abdullah",
        role: "requester",
        password: "hash2usingpasscodejs",
        title: "Post4" 
    },
    {
        name: "Aman",
        role: "approver",
        password: "hash2usingpasscodejs",
        title: "Post5" 
    }
]

app.post('/token', (req, res) => {
    const refreshToken = req.body.token
    if (refreshToken == null) return res.sendStatus(401)
    if (refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        const accessToken = generateAccessToken({ name: user.name })
        res.json({ accessToken: accessToken })
    })
})

app.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204)
})

app.post('/login', (req, res) => {
    //Authentcating the User
    console.log(req.body)
    const username = req.body.username
    const name = { name: username }
    const role = req.body.role
    const password = req.body.password
    for (let obj of users) {
        if (obj.name == username && obj.role == role && obj.password == password) {
            console.log("Valid user in DB")
            const accessToken = generateAccessToken(user)
            const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
            refreshTokens.push(refreshToken)
            res.json({ accessToken: accessToken, refreshToken: refreshToken })
        }
    }
    res.json({ message: "Invalid User, No user found in DB" })
})

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresInt: '15s' })
}

app.get('/posts', authenticateToken, (req, res) => {
    res.json(posts.filter(post => post.username === req.user.name))
})

app.get('/userlist', authenticateToken, (req, res) => {

    const username = req.body.username
    const name = { name: username }
    const role = req.body.role
    for (let obj of users) {
        if (obj.name == username && obj.role == "admin" ) {
            console.log("Admin role access")
            res.json(users)
        }
    }
    res.json({ message: "Unauthorized user, Accessible only to Admin" })
    
})

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}
 // for Anangram 

 app.get('/isAnagram', (req, res) => {
    let string = req.body.msg.split('; ')
    const check = isAnagram('allahabad', 'llhaabaad');
    console.log(check) 
    if (check) {
        res.json({ message: "Is Anagram Success, Given string is Anagram" })
    }
    res.json({ message: "Anagram Failure, Given string is not Anagram" })
})

function isAnagram(string1, string2) {
    if (string1.length !== string2.length) {
        return false;
    }
    let counter = {}
    for (let letter of string1) {
        counter [letter] = (counter[letter] || 0) +1;
        console.log(counter[letter])
    }
    console.log(counter)
    for (let items of string2) {
        if (!counter[items]) {
            console.log("for arrangement or a number of quantity")
            return false;
        }
        counter[items]-=1
    }
    return true;
}

app.listen(3000)