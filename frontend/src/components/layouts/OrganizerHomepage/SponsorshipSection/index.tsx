import {Link} from "react-router";
import {t} from "@lingui/macro";
import {Organizer} from "../../../../types.ts";
import {organizerHomepagePath} from "../../../../utilites/urlHelper.ts";
import classes from './SponsorshipSection.module.scss';

interface SponsorshipSectionProps {
    organizer: Organizer;
}

export const SponsorshipSection = ({organizer}: SponsorshipSectionProps) => (
    <section className={classes.section}>
        <h2 className={classes.heading}>{t`Partner with us`}</h2>
        <p className={classes.copy}>
            {t`Our events bring together hundreds of families from across the school community, and every one of them is made possible by local businesses who believe in what we do.`}
        </p>
        <p className={classes.copy}>
            {t`We are looking for sponsors who offer products and services related to school themes, such as stationery, uniforms, books, learning resources and children's activities. Sponsoring a Friends of Repton event is a great way to reach parents and pupils while supporting the school.`}
        </p>
        <p className={classes.copy}>
            {t`Get in touch to hear about the sponsorship opportunities available and how we can showcase your brand.`}
        </p>
        <Link
            to={`${organizerHomepagePath(organizer)}/about#get-in-touch`}
            className={classes.button}
            data-testid="sponsorship-contact-button"
        >
            {t`Get in touch`}
        </Link>
    </section>
);

export default SponsorshipSection;
