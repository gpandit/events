import {IconUser} from "@tabler/icons-react";
import {Image, TeamMember} from "../../../types.ts";
import classes from './PublicOrganizerAbout.module.scss';

interface TeamSectionProps {
    heading: string;
    members: TeamMember[];
    images: Image[];
    groupPhoto?: Image;
}

export const TeamSection = ({heading, members, images, groupPhoto}: TeamSectionProps) => {
    if (members.length === 0 && !groupPhoto) {
        return null;
    }

    return (
        <section className={classes.teamSection}>
            <h2 className={classes.heading}>{heading}</h2>
            {groupPhoto && (
                <img src={groupPhoto.url} alt={heading} className={classes.groupPhoto}/>
            )}
            <div className={classes.teamGrid}>
                {members.map((member, position) => {
                    const photo = images.find((image) => image.id === member.image_id);

                    return (
                        <div key={position} className={classes.member}>
                            <div className={classes.photo}>
                                {photo
                                    ? <img src={photo.url} alt={member.name} className={classes.photoImage}/>
                                    : <IconUser size={48}/>}
                            </div>
                            <div className={classes.memberDetails}>
                                <span className={classes.memberName}>{member.name}</span>
                                {member.role && <span className={classes.memberRole}>{member.role}</span>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};
