import { CfnOutput } from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as sst from "@serverless-stack/resources";

export default class DynamoDBStack extends sst.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const app = this.node.root;

    const table = new dynamodb.Table(this, "myAppTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // Use on-demand billing mode
      partitionKey: { name: "pK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sK", type: dynamodb.AttributeType.STRING },
    });
    //optionally, usually needed, global index
    table.addGlobalSecondaryIndex({
      indexName: 'sKpK',
      partitionKey: { name: "sK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "pK", type: dynamodb.AttributeType.STRING },
    })
    // Output values
    new CfnOutput(this, "TableName", {
      value: table.tableName,
      exportName: app.logicalPrefixedName("ExtTableName"),
    });
    new CfnOutput(this, "TableArn", {
      value: table.tableArn,
      exportName: app.logicalPrefixedName("ExtTableArn"),
    });
    new CfnOutput(this, "TableArnIndex", {
      value: table.tableArn+'/index/*',
      exportName: app.logicalPrefixedName("ExtTableArnIndex"),
    });
  }
}
