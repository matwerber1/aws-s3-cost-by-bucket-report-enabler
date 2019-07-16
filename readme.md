# AWS S3 Cost By Bucket Report Enabler

AWS Cost Explorer allows you to view aggregate Amazon S3 costs by dimensions including but not limited to date, region, and AWS account ID. However, out-of-the-box, you cannot view AWS costs by individual bucket within the Cost Explorer.

However, the Cost Explorer does allow you to designate one or more AWS resource tags as [Cost Allocation Tags](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/cost-alloc-tags.html), which means you can use them to further group costs in the Cost Explorer. 

Therefore, if you tag each Amazon S3 bucket with a tag equal to the bucket's name, you can configure that tag as a cost allocation tag and have it appear in your cost reports!

Rather than do this manually, the included `index.js` function will programmatically obtain a list of all Amazon S3 buckets (in the current region), inspects each bucket's tags, and if a `BucketName` tag is not present, it adds in `BucketName` tag with a value equal to the bucket's name. If the tag is present but, for some reason, the value does not match the bucket name, it also correct's the tag's value to match the bucket name. 

## Deployment

1. Run this script, review output to confirm that buckets were updated as/if needed:

  ```
  node index.js
  ```

2. Navigate to [AWS Cost Explorer's **cost allocation tags**](https://console.aws.amazon.com/billing/home?#/preferences/tags) configuration page. 

3. Search for the `BucketName` tag, select it, and click **Activate**

4. Wait up to ~24 hours for the tag to be reflected in the cost reports. 

5. Navigate to the [AWS Cost Explorer](https://console.aws.amazon.com/cost-reports/home#/custom?groupBy=None&hasBlended=false&hasAmortized=false&excludeDiscounts=true&excludeTaggedResources=false&timeRangeOption=Custom&granularity=Daily&reportName=&reportType=CostUsage&isTemplate=true&startDate=2019-06-01&endDate=2019-07-16&filter=%5B%7B%22dimension%22:%22RecordType%22,%22values%22:%5B%22Refund%22,%22Credit%22%5D,%22include%22:false,%22children%22:null%7D%5D&forecastTimeRangeOption=None&usageAs=usageQuantity&chartStyle=Group), click the **More** button on the graph, select **Tag**, and choose **BucketName** as the **Group by** option. 

6. Profit. 
