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
            item.company = 'TCB';
            item.tabName = 'ShopField';
            if(item.Period === 'Annually'){
                item.Period = 'Annual'
            }
            if(item.Period === 'SemiAnnual' || item.Period === 'Semi Annual'){
                item.Period = 'Semi-Annual'
            }
            if(item.Period === 'Semi-Monthly' || item.Period === 'Semi Monthly'){
                item.Period = 'Bi-Monthly';
            }
            if(item.Period === 'Biweekly'){
                item.Period = 'Bi-Weekly';
            }
            if(typeof(item['1st warn']) === 'string'){
                item['1st warn'] = 1;
            }
            await ChecklistItem.create(item);
            console.log('Item Created');
        }
    } catch (error) {
        console.log(error);
    }
}

const items = JSON.parse(fs.readFileSync(`${__dirname}/_data/shopfield_tcb_data_renamed.json`, 'utf-8'));
seedChecklistItems(items);