const dotenv = require('dotenv');
const express = require('express');
const fs = require('fs');
const ChecklistItem = require('./models/checklist/ChecklistItem');
const connectDB = require('./config/db');


dotenv.config({ path: './config/config.env' });

connectDB();
const app = express();
//PORT
const PORT = process.env.PORT || 5000;

//start server
const server = app.listen(PORT, console.log(`Server Running on PORT ${PORT}`));

const seedChecklistItems = async(items) => {
    try {
        for(let item of items){
            item.company = 'Marler';
            item.tabName = 'Checklist'
            await ChecklistItem.create(item);
            console.log('Item Created');
        }
    } catch (error) {
        console.log(error);
    }
}

const items = JSON.parse(fs.readFileSync(`${__dirname}/_data/item_data.json`, 'utf-8'));
seedChecklistItems(items);