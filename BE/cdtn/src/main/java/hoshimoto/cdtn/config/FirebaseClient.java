package hoshimoto.cdtn.config;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;

@Component
public class FirebaseClient {
    private static final Logger logger = LoggerFactory.getLogger(FirebaseClient.class);
    private static final String CREDENTIALS_ENV = "FIREBASE_CREDENTIALS";
    private static final String CREDENTIALS_PROP = "firebase.credentials";

    private final Environment environment;

    private volatile Firestore firestore;
    private volatile boolean initAttempted = false;

    public FirebaseClient(Environment environment) {
        this.environment = environment;
    }

    public Firestore getFirestore() {
        if (firestore != null || initAttempted) {
            return firestore;
        }
        synchronized (this) {
            if (firestore != null || initAttempted) {
                return firestore;
            }
            initAttempted = true;
            String credentialsPath = resolveCredentialsPath();
            if (credentialsPath == null || credentialsPath.isBlank()) {
                logger.warn("Firebase disabled: missing {} property or {} env var", CREDENTIALS_PROP, CREDENTIALS_ENV);
                return null;
            }

            try (InputStream input = new FileInputStream(credentialsPath)) {
                GoogleCredentials credentials = GoogleCredentials.fromStream(input);
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(credentials)
                        .build();

                FirebaseApp app;
                if (FirebaseApp.getApps().isEmpty()) {
                    app = FirebaseApp.initializeApp(options);
                } else {
                    app = FirebaseApp.getInstance();
                }

                firestore = FirestoreClient.getFirestore(app);
                logger.info("Firebase initialized for realtime notifications");
                return firestore;
            } catch (IOException ex) {
                logger.warn("Firebase disabled: cannot load service account JSON", ex);
                return null;
            }
        }
    }

    private String resolveCredentialsPath() {
        String fromProperty = environment.getProperty(CREDENTIALS_PROP);
        if (fromProperty != null && !fromProperty.isBlank()) {
            return fromProperty;
        }
        String fromSystem = System.getProperty(CREDENTIALS_PROP);
        if (fromSystem != null && !fromSystem.isBlank()) {
            return fromSystem;
        }
        return System.getenv(CREDENTIALS_ENV);
    }
}
