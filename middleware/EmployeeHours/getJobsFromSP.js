const createJobNumberNameModel = require("../../models/EmployeeHours/JobNumberName");
const { getFolderNamesFromSharePoint, getListItemsFromSharePoint } = require("../../utils/EmployeeHours/sp/fetchSPContent");

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

        // console.log(jobs, lists)

        // Create job objects, ensuring unique entries
        let jobArr = Array.from(
            new Map(
                joinedJobs.map(job => [
                    Number(job.split(' ')[0]),
                    {
                        JobNumber: Number(job.split(' ')[0]),
                        JobName: job.split(' ').slice(1).join(' ').trim(),
                        Active: true,
                    },
                ])
            ).values()
        );

        // Fetch existing job numbers in a single query
        const JobNumberName = createJobNumberNameModel(req.db);
        const dbJobs = await JobNumberName.findAll({
            attributes: ['JobNumber', 'Active'], // Fetch only necessary fields
        });

        // Create maps for quick lookup
        const dbJobsMap = new Map(dbJobs.map(dbJob => [dbJob.JobNumber, dbJob.Active]));
        const jobArrMap = new Map(jobArr.map(job => [job.JobNumber, job]));

        // Prepare lists for bulk operations
        const jobsToCreate = [];
        const jobsToUpdateActive = [];
        const jobsToUpdateInactive = [];

        // Iterate over jobArr to determine actions
        jobArr.forEach(job => {
            if (!dbJobsMap.has(job.JobNumber)) {
                // New job to insert
                jobsToCreate.push(job);
            } else if (dbJobsMap.get(job.JobNumber) === false) {
                // Existing job, but inactive - activate it
                jobsToUpdateActive.push(job.JobNumber);
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

        // , { ignoreDuplicates: true }

        if (jobsToUpdateActive.length > 0) {
            await JobNumberName.update(
                { Active: true },
                { where: { JobNumber: jobsToUpdateActive } }
            );
        }

        // console.log(jobsToUpdateInactive)

        if (jobsToUpdateInactive.length > 0) {
            await JobNumberName.update(
                { Active: false },
                { where: { JobNumber: jobsToUpdateInactive } }
            );
        }

        next();
    } catch (error) {
        console.error(error);
        next(); // Continue operation despite the error
    }
}

module.exports = getJobsFromSP