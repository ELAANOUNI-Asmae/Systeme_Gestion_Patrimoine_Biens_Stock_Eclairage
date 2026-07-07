pipeline {
    // On utilise une image Maven pour faire le build, isolée du conteneur Jenkins
    agent {
        docker {
            image 'maven:3.9-eclipse-temurin-21'
            args '--network sgpbse_default'
        }
    }

    environment {
        SONAR_TOKEN = credentials('sonar-token')
    }

    stages {
        stage('Checkout Git via SSH') {
            steps {
                // Utilisation de la clé SSH qu'on a configurée
                //Celui est un commentaire pour tester le pieline jznkins
                git credentialsId: 'github-ssh-key',
                    url: 'git@github.com:ELAANOUNI-Asmae/Syst-me_Gestion_Patrimoine_Biens_Stock_Eclairage',
                    branch: 'master'
            }
        }

        stage('Build & Tests avec JaCoCo') {
            steps {
                // Compilation et génération du rapport JaCoCo
                sh 'mvn clean test'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                // Envoi du code + rapport JaCoCo à SonarQube
                withSonarQubeEnv('SonarQube') {
                    sh "mvn sonar:sonar -Dsonar.login=${SONAR_TOKEN}"
                }
            }
        }
    }
}