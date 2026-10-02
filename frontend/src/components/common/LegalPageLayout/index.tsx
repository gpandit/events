import React from "react";
import {Link} from "react-router";
import {Container} from "@mantine/core";
import {Helmet} from "react-helmet-async";
import {IconArrowLeft} from "@tabler/icons-react";
import {t} from "@lingui/macro";
import classes from "./LegalPageLayout.module.scss";

interface LegalPageLayoutProps {
    title: string;
    updatedDate: string;
    children: React.ReactNode;
}

export const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({title, updatedDate, children}) => {
    return (
        <div className={classes.page}>
            <Helmet title={title}/>
            <Container size="md" className={classes.container}>
                <Link to="/" className={classes.backLink}>
                    <IconArrowLeft size={16}/>
                    {t`Back to home`}
                </Link>

                <h1 className={classes.title}>{title}</h1>
                <p className={classes.updated}>{t`Last updated: ${updatedDate}`}</p>

                <div className={classes.content}>
                    {children}
                </div>
            </Container>
        </div>
    );
};

export default LegalPageLayout;
