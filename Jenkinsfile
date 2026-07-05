pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'Code récupéré depuis GitHub'
            }
        }

        stage('Build') {
            steps {
                bat 'mvn clean package -DskipTests'
            }
        }

        stage('Test') {
            steps {
                bat 'mvn test'
            }
        }
    }
}