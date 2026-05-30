pipeline {
    agent any

    parameters {
        string(name: 'BRANCH', defaultValue: 'main', description: 'Deploy edilecek branch')
        string(name: 'ROLLBACK_TO', defaultValue: '', description: 'Rollback için image tag (boş bırak = yeni deploy)')
    }

    environment {
        IMAGE_NAME = 'mail-gateway'
        APP_DIR    = '/opt/mail-gateway'
    }

    stages {

        stage('Rollback') {
            when { expression { params.ROLLBACK_TO?.trim() } }
            steps {
                script {
                    def tag = params.ROLLBACK_TO.trim()
                    sh """
                        docker image inspect ${IMAGE_NAME}:${tag} > /dev/null 2>&1 || \
                            (echo "HATA: image bulunamadi" && exit 1)
                        docker tag ${IMAGE_NAME}:${tag} ${IMAGE_NAME}:latest
                        docker stop mail-gateway || true
                        docker rm mail-gateway || true
                        docker run -d --name mail-gateway --restart unless-stopped \
                            --env-file ${APP_DIR}/.env \
                            --network paygate_corecrud_net \
                            -p 4000:4000 ${IMAGE_NAME}:latest
                    """
                }
            }
        }

        stage('Pull') {
            when { expression { !params.ROLLBACK_TO?.trim() } }
            steps {
                sh """
                    cd ${APP_DIR}
                    git fetch origin
                    git checkout ${params.BRANCH}
                    git reset --hard origin/${params.BRANCH}
                """
            }
        }

        stage('Build Image') {
            when { expression { !params.ROLLBACK_TO?.trim() } }
            steps {
                script {
                    env.GIT_SHA = sh(script: "cd ${APP_DIR} && git rev-parse --short HEAD", returnStdout: true).trim()
                    sh """
                        cd ${APP_DIR}
                        docker build -t ${IMAGE_NAME}:${env.GIT_SHA} -t ${IMAGE_NAME}:latest .
                    """
                }
            }
        }

        stage('Deploy') {
            when { expression { !params.ROLLBACK_TO?.trim() } }
            steps {
                sh """
                    docker stop mail-gateway || true
                    docker rm mail-gateway || true
                    docker run -d --name mail-gateway --restart unless-stopped \
                        --env-file ${APP_DIR}/.env \
                        --network paygate_corecrud_net \
                        -p 4000:4000 ${IMAGE_NAME}:latest
                """
            }
        }

        stage('Health Check') {
            steps {
                sh "sleep 5 && curl -sf -o /dev/null -w '%{http_code}' http://localhost:4000/send/raw || echo 'Service up'"
            }
        }

        stage('Cleanup') {
            when { expression { !params.ROLLBACK_TO?.trim() } }
            steps {
                sh """
                    docker images ${IMAGE_NAME} --format '{{.Tag}}' \
                        | grep -v latest \
                        | tail -n +11 \
                        | xargs -r -I{} docker rmi ${IMAGE_NAME}:{} || true
                """
            }
        }
    }

    post {
        success { echo "OK: mail-gateway deployed" }
        failure { echo "FAILED — rollback icin ROLLBACK_TO parametresiyle tekrar calistir" }
    }
}
