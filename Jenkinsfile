pipeline {
  agent {
        node {
            label 'ubuntu'
        }
    }
  environment {
      MAVEN_HOME = '/opt/maven'
      PATH = "${MAVEN_HOME}/bin:${env.PATH}"
  }

  tools {
        maven 'Maven 3 (latest)'
        jdk 'JDK 1.8 (latest)'
    }


  stages {
        stage('Initialization') {
              steps {
                  echo 'Building Branch: ' + env.BRANCH_NAME
                  echo 'Using PATH = ' + env.PATH
              }
         }

         stage('Cleanup') {
              steps {
                  echo 'Cleaning up the workspace'
                  deleteDir()
              }
         }
        stage('Checkout') {
            steps {
                echo 'Checking out branch ' + env.BRANCH_NAME
                checkout scm
            }
        }
        stage('Build and deploy backend') {
            when {
                branch 'dev'
            }
            steps {
                sh 'mvn clean deploy javadoc:aggregate'
            }
        }
        stage('Build backend') {
            when {
                expression {
                    env.BRANCH_NAME != 'dev'
                }
            }
            steps {
                sh 'mvn clean package'
            }
        }
    }

// Send out notifications on unsuccessful builds.
    post {
        // If this build failed, send an email to the list.
        failure {
            script {
                if(env.BRANCH_NAME == "dev") {
                    emailext(
                        subject: "[BUILD-FAILURE]: Job '${env.JOB_NAME} [${env.BRANCH_NAME}] [${env.BUILD_NUMBER}]'",
                        body: """
BUILD-FAILURE: Job '${env.JOB_NAME} [${env.BRANCH_NAME}] [${env.BUILD_NUMBER}]':
Check console output at "<a href="${env.BUILD_URL}">${env.JOB_NAME} [${env.BRANCH_NAME}] [${env.BUILD_NUMBER}]</a>"
""",
                        to: "dev@streampipes.apache.org",
                        recipientProviders: [[$class: 'DevelopersRecipientProvider']]
                    )
                }
            }
        }

        // If this build didn't fail, but there were failing tests, send an email to the list.
        unstable {
            script {
                if(env.BRANCH_NAME == "dev") {
                    emailext(
                        subject: "[BUILD-UNSTABLE]: Job '${env.JOB_NAME} [${env.BRANCH_NAME}] [${env.BUILD_NUMBER}]'",
                        body: """
BUILD-UNSTABLE: Job '${env.JOB_NAME} [${env.BRANCH_NAME}] [${env.BUILD_NUMBER}]':
Check console output at "<a href="${env.BUILD_URL}">${env.JOB_NAME} [${env.BRANCH_NAME}] [${env.BUILD_NUMBER}]</a>"
""",
                        to: "dev@streampipes.apache.org",
                        recipientProviders: [[$class: 'DevelopersRecipientProvider']]
                    )
                }
            }
        }

        // Send an email, if the last build was not successful and this one is.
        success {
            // Cleanup the build directory if the build was successful
            // (in this cae we probably don't have to do any post-build analysis)
            deleteDir()
            script {
                if ((env.BRANCH_NAME == "dev") && (currentBuild.previousBuild != null) && (currentBuild
                .previousBuild.result != 'SUCCESS')) {
                    emailext (
                        subject: "[BUILD-STABLE]: Job '${env.JOB_NAME} [${env.BRANCH_NAME}] [${env.BUILD_NUMBER}]'",
                        body: """
BUILD-STABLE: Job '${env.JOB_NAME} [${env.BRANCH_NAME}] [${env.BUILD_NUMBER}]':
Is back to normal.
""",
                        to: "dev@streampipes.apache.org",
                        recipientProviders: [[$class: 'DevelopersRecipientProvider']]
                    )
                }
            }
        }

        always {
            script {
                if(env.BRANCH_NAME == "master") {
                    // Double check if something was really changed as sometimes the
                    // build just runs without any changes.
                    if(currentBuild.changeSets.size() > 0) {
                        emailext(
                            subject: "[COMMIT-TO-MASTER]: A commit to the master branch was made'",
                            body: """
COMMIT-TO-MASTER: A commit to the master branch was made:
Check console output at "<a href="${env.BUILD_URL}">${env.JOB_NAME} [${env.BRANCH_NAME}] [${env.BUILD_NUMBER}]</a>"
""",
                            to: "dev@streampipes.apache.org",
                            recipientProviders: [[$class: 'DevelopersRecipientProvider']]
                        )
                    }
                }
            }
        }
    }
}