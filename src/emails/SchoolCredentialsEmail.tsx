import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
} from "@react-email/components";

type Props = {
    schoolName: string;
    username: string;
    password: string;
    appName: string;
};

export default function SchoolCredentialsEmail({
    schoolName,
    username,
    password,
    appName,
}: Props) {
    return (
        <Html>

            <Head />

            <Preview>
                Vos accès à votre nouvel espace école
            </Preview>

            <Body
                style={{
                    backgroundColor: "#f5f5f5",
                    fontFamily: "Arial",
                }}
            >

                <Container
                    style={{
                        background: "#ffffff",
                        padding: 40,
                        margin: "30px auto",
                        borderRadius: 8,
                    }}
                >

                    <Heading>
                        Bienvenue sur {appName}
                    </Heading>

                    <Text>

                        Bonjour,

                    </Text>

                    <Text>

                        Votre établissement a été créé avec succès.

                    </Text>

                    <Hr />

                    <Section>

                        <Text>

                            <strong>Ecole :</strong>

                            {" "}

                            {schoolName}

                        </Text>

                        <Text>

                            <strong>Nom d'utilisateur :</strong>

                            {" "}

                            {username}

                        </Text>

                        <Text>

                            <strong>Mot de passe :</strong>

                            {" "}

                            {password}

                        </Text>

                    </Section>

                    <Hr />

                    <Text>

                        Pour des raisons de sécurité,
                        changez votre mot de passe
                        dès votre première connexion.

                    </Text>

                    <Text>

                        Merci de votre confiance.

                    </Text>

                    <Text>

                        L'équipe {appName}

                    </Text>

                </Container>

            </Body>

        </Html>
    );
}