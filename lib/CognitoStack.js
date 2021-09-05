import { CfnOutput } from "@aws-cdk/core";
import * as cognito from "@aws-cdk/aws-cognito";
import * as sst from "@serverless-stack/resources";
import CognitoAuthRole from "./CognitoAuthRole";
import * as iam from "@aws-cdk/aws-iam";

export default class CognitoStack extends sst.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const { bucketArn } = props;

    const app = this.node.root;

    const userPool = new cognito.UserPool(this, "UserPool", {
      userPoolName: "userPoolMyApp",
      selfSignUpEnabled: false, // Allow users to sign up
      autoVerify: { email: true, phone: true }, // Verify email addresses by sending a verification code
      signInAliases: { email: true, phone: true, username: true}, // Set email as an alias
      signInCaseSensitive: false,
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      standardAttributes: {
        fullname: {
          required: true,
          mutable: true,
        }
      },
      customAttributes: {
        'cpfCnpj': new cognito.StringAttribute({ minLen: 14, maxLen: 18, mutable: false }),
        'joinedOn': new cognito.DateTimeAttribute(),
      },
      mfaMessage: "Olá {username}, essa é uma mensagem de verificação, seu código é: {####}",
      passwordPolicy: {
        minLength: 8,
        requireDigits: true,
        requireUppercase: true,
        requireSymbols: true,
        requireLowercase: true
      },
      userInvitation: {
        emailSubject: "Vem comigo BRO!",
        emailBody: "<body>Olá {username}.<p>Você foi convidado para colaborar com nosso time, bem vindo!<p>Sua senha temporária é: {####}</body>",
        smsMessage: "Olá {username}. Você foi convidado para colaborar com nosso time, bem vindo! \nSua senha temporária é: {####}"
      },
      // userVerification: {
      //   emailSubject: 'Verifique seu email.',
      //   emailBody: '<body>Estamos felizes em ter você com a gente. <p>Verifique o seu email usando este código: {####}</body>',
      //   emailStyle: cognito.VerificationEmailStyle.CODE,
      //   smsMessage: 'Estamos felizes em ter você com a gente. \nVerifique o seu celular usando este código: {####}',
      // },
      mfa: cognito.Mfa.REQUIRED,
      enableSmsRole: true,
      mfaSecondFactor: {
        sms: true,
        otp: true
      },
      ...(process.env.STAGE === 'production' ? {
        emailSettings: {
          from: 'contato@meudominio.com.br',
          replyTo: 'suporte@meudominio.com.br',
        }
      }:{})
    });

    const userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
      userPool,
      generateSecret: false, // Don't need to generate secret for web app running on browsers
    });

    const identityPool = new cognito.CfnIdentityPool(this, "IdentityPool", {
      allowUnauthenticatedIdentities: false, // Don't allow unathenticated users
      cognitoIdentityProviders: [
        {
          clientId: userPoolClient.userPoolClientId,
          providerName: userPool.userPoolProviderName,
        },
      ],
    });

    const authenticatedRole = new CognitoAuthRole(this, "CognitoAuthRole", {
      identityPool,
    });

    authenticatedRole.role.addToPolicy(
      // IAM policy for allowing users to upload to their own folder in the S3 bucket
      new iam.PolicyStatement({
        actions: ["s3:*"],
        effect: iam.Effect.ALLOW,
        resources: [
          bucketArn + "/private/${cognito-identity.amazonaws.com:sub}/*",
          bucketArn + "/private/${cognito-identity.amazonaws.com:sub}",
        ],
      })
    );

    authenticatedRole.role.addToPolicy(
      // IAM policy for allowing users to read and upload to public and protected folders in the S3 bucket
      new iam.PolicyStatement({
        actions: [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
        ],
        effect: iam.Effect.ALLOW,
        resources: [
          bucketArn + "/public/${cognito-identity.amazonaws.com:sub}/*",
          bucketArn + "/public/${cognito-identity.amazonaws.com:sub}",
          bucketArn + "/protected/${cognito-identity.amazonaws.com:sub}/*",
          bucketArn + "/protected/${cognito-identity.amazonaws.com:sub}",
        ],
      })
    );

    authenticatedRole.role.addToPolicy(
      // IAM policy for allowing users to read from protected and public folders in the S3 bucket
      new iam.PolicyStatement({
        actions: [
          "s3:GetObject",
        ],
        effect: iam.Effect.ALLOW,
        resources: [
          bucketArn + "/protected/*",
          bucketArn + "/public/*",
        ],
      })
    );

    // Export values
    new CfnOutput(this, "UserPoolId", {
      value: userPool.userPoolId,
    });
    new CfnOutput(this, "UserPoolClientId", {
      value: userPoolClient.userPoolClientId,
    });
    new CfnOutput(this, "IdentityPoolId", {
      value: identityPool.ref,
    });
    new CfnOutput(this, "AuthenticatedRoleName", {
      value: authenticatedRole.role.roleName,
      exportName: app.logicalPrefixedName("ExtCognitoAuthRole"),
    });
  }
}
