pipeline {
    // On dit à Jenkins de s'exécuter directement sur lui-même
    agent any

    environment {
        SONAR_TOKEN = credentials('sonar-token')
    }

    stages {
        stage('Checkout Git via SSH') {
            steps {
                git credentialsId: 'github-ssh-key',
                    url: 'git@github.com:ELAANOUNI-Asmae/Systeme_Gestion_Patrimoine_Biens_Stock_Eclairage.git',
                    branch: 'master'
            }
        }

        stage('Build & Tests avec JaCoCo') {
            steps {
                // Exécution directe de Maven sur le conteneur Jenkins
                sh 'mvn clean test'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    // Envoi à SonarQube
                    sh "mvn sonar:sonar -Dsonar.login=${SONAR_TOKEN}"
                }
            }
        }
    }
}