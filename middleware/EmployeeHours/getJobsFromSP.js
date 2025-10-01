const createJobNumberNameModel = require("../../models/EmployeeHours/JobNumberName");
const { getFolderNamesFromSharePoint, getListItemsFromSharePoint } = require("../../utils/EmployeeHours/sp/fetchSPContent");
const { Op } = require('sequelize');


/**
 * @description Middleware to update the jobs in the db - gets folders from sharepoint list and sharepoint folders to create the list and compare with the current items in the DB
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const getJobsFromSP = async(req, res, next) => {
    try {
        // Get folder names and filter with regex
        let folders = await getFolderNamesFromSharePoint();
        const regex = /^[0-9]{4} .+$/;
        let jobs = folders.filter(folder => regex.test(folder));

       // Get additional jobs from SharePoint lists
        let lists = await getListItemsFromSharePoint();

        let joinedJobs = [...jobs, ...lists];

        // Create job objects, ensuring unique entries
        let jobArr = Array.from(
            new Map(
                joinedJobs
                    .map(job => {
                        const jobNumber = Number(job.split(' ')[0]);
                        if (!jobNumber || isNaN(jobNumber)) return null;
                        return [
                            jobNumber,
                            {
                                JobNumber: jobNumber,
                                JobName: job.split(' ').slice(1).join(' ').trim(),
                                Active: true,
                            },
                        ];
                    })
                    .filter(Boolean)
            ).values()
        );

        // Fetch existing job numbers in a single query
        const JobNumberName = createJobNumberNameModel(req.db);
        const dbJobs = await JobNumberName.findAll({
            attributes: ['JobNumber', 'JobName', 'Active'], // Fetch only necessary fields
        });

        // Create maps for quick lookup
        const dbJobsMap = new Map(
            dbJobs.map(dbJob => [dbJob.JobNumber, { JobName: dbJob.JobName, Active: dbJob.Active }]));
        const jobArrMap = new Map(jobArr.map(job => [job.JobNumber, job]));

        // Prepare lists for bulk operations
        const jobsToCreate = [];
        const jobsToUpdateActive = [];
        const jobsToUpdateInactive = [];
        const jobsToUpdateName = [];

        // Iterate over jobArr to determine actions
        jobArr.forEach(job => {
            const existing = dbJobsMap.get(job.JobNumber);

            if(!existing){
                jobsToCreate.push(job);
            } else {
                const nameChanged = existing.JobName !== job.JobName;
                const isInactive = existing.Active === false

                if(nameChanged){ 
                    jobsToUpdateName.push({JobNumber: job.JobNumber, JobName: job.JobName});
                }

                if(isInactive){
                    jobsToUpdateActive.push(job.JobNumber)
                }
            }
        });

        // Find jobs in the database but not in jobArr
        dbJobs.forEach(dbJob => {
            if (!jobArrMap.has(dbJob.JobNumber) && dbJob.Active) {
                // Job exists in the database but is missing in jobArr - deactivate it
                jobsToUpdateInactive.push(dbJob.JobNumber);
            }
        });

        // Perform bulk operations
        if (jobsToCreate.length > 0) {
            await JobNumberName.bulkCreate(jobsToCreate);
        }

        if (jobsToUpdateActive.length > 0) {
            await JobNumberName.update(
                { Active: true },
                {
                    where: {
                        JobNumber: {
                            [Op.in]: jobsToUpdateActive
                        }
                    }
                }
            );
        }

        if (jobsToUpdateInactive.length > 0) {
            await JobNumberName.update(
                { Active: false },
                {
                    where: {
                        JobNumber: {
                            [Op.in]: jobsToUpdateInactive
                        }
                    }
                }
            );
        }

        for (const job of jobsToUpdateName) {
            await JobNumberName.update(
                { JobName: job.JobName },
                { where: { JobNumber: job.JobNumber } }
            );
        }

        next();
    } catch (error) {
        console.error(error);
        next(); // Continue operation despite the error
    }
}

module.exports = getJobsFromSP