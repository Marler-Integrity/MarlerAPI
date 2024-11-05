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
        let jobArr = [];
        let folders = await getFolderNamesFromSharePoint();

        const regex = /^[0-9]{4} .+$/; //regex test to rule out non job folders

        let jobs = folders.filter((folder) => {
            if(regex.test(folder)) return folder;
        });

        //array of list items with the job number and name
        let lists = await getListItemsFromSharePoint();

        let joinedJobs = [...jobs, ...lists];

        //create the objects
        joinedJobs.forEach(job => {
            jobArr.push({JobNumber: Number(job.split(' ')[0]), JobName: job.split(' ').slice(1).join(' ').trim(), Active: true});
        });

        //get db data for comparison
        const JobNumberName = createJobNumberNameModel(req.db);
        let dbJobs = await JobNumberName.findAll();

        let dbJobNumbersSet = new Set(dbJobs.map(dbJob => dbJob.JobNumber));

        // Iterate over jobArr to create new records if they don't exist in dbJobs
        for (const job of jobArr) {
            if (!dbJobNumbersSet.has(job.JobNumber)) {
                // JobNumber exists in jobArr but not in dbJobs, create a new record
                await JobNumberName.create({
                    JobNumber: job.JobNumber,
                    JobName: job.JobName,
                    Active: true
                });
            }
        }

        // Create a Set of JobNumbers from jobArr for easy lookup
        const jobArrJobNumbersSet = new Set(jobArr.map(job => job.JobNumber));

        // Iterate over dbJobs to set `active` to false if not found in jobArr
        for (const dbJob of dbJobs) {
            // Check if the JobNumber exists in jobArr
            if (!jobArrJobNumbersSet.has(dbJob.JobNumber)) {
                // JobNumber exists in dbJobs but not in jobArr, set `active` to false and update
                await JobNumberName.update(
                    { Active: false },
                    { where: { JobNumber: dbJob.JobNumber } }
                );
            } else {
                // JobNumber exists in both jobArr and dbJobs, check if it's active in jobArr
                const jobInArr = jobArr.find(job => job.JobNumber === dbJob.JobNumber);
                if (jobInArr && jobInArr.Active === true && dbJob.Active === false) {
                    // Update dbJob to set `Active` to true if needed
                    await JobNumberName.update(
                        { Active: true },
                        { where: { JobNumber: dbJob.JobNumber } }
                    );
                }
            }
        }

        next();
    } catch (error) {
        console.log(error);
        // calling next here so it continues operating
        // this middleware is not 100% necessary to continue operations
        // consider adding logging of some sort to ensure this is eventually caught and dealt with
        next();
    }
}

module.exports = getJobsFromSP