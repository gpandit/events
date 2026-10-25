import {useRef, useState} from "react";
import {t} from "@lingui/macro";
import {ActionIcon, Avatar, Button, Group, Stack, Text, TextInput} from "@mantine/core";
import {IconPhotoUp, IconPhotoX, IconPlus, IconTrash, IconUser} from "@tabler/icons-react";
import {IdParam, Image, TeamMember} from "../../../../../types.ts";
import {useUploadImage} from "../../../../../mutations/useUploadImage.ts";
import {useDeleteImage} from "../../../../../mutations/useDeleteImage.ts";
import {showError} from "../../../../../utilites/notifications.tsx";
import {extractImageUploadErrors, validateImageFile} from "../../../../../utilites/imageUploadValidation.ts";

interface TeamMembersEditorProps {
    label: string;
    description: string;
    members: TeamMember[];
    images: Image[];
    organizerId: IdParam;
    maxMembers: number;
    onChange: (members: TeamMember[]) => void;
    onImagesChange: () => void;
}

export const TeamMembersEditor = ({
                                      label,
                                      description,
                                      members,
                                      images,
                                      organizerId,
                                      maxMembers,
                                      onChange,
                                      onImagesChange,
                                  }: TeamMembersEditorProps) => {
    const [busyPosition, setBusyPosition] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const uploadTargetRef = useRef<number>(0);
    const uploadImage = useUploadImage();
    const deleteImage = useDeleteImage();

    const updateMember = (position: number, member: TeamMember) => {
        onChange(members.map((existing, index) => (index === position ? member : existing)));
    };

    const deleteImageById = (imageId: IdParam | undefined, onSettled: () => void) => {
        if (!imageId) {
            onSettled();
            return;
        }

        deleteImage.mutate({imageId}, {
            onError: () => showError(t`Something went wrong while deleting the image. Please try again.`),
            onSettled: () => {
                onImagesChange();
                onSettled();
            },
        });
    };

    const handleUpload = (files: FileList | null) => {
        const file = files?.[0];
        const position = uploadTargetRef.current;
        if (!file) {
            return;
        }

        const validationError = validateImageFile(file);
        if (validationError) {
            showError(validationError);
            return;
        }

        setBusyPosition(position);
        uploadImage.mutate(
            {image: file, imageType: 'TEAM_MEMBER_PHOTO', entityId: organizerId},
            {
                onSuccess: (response) => {
                    const previousImageId = members[position]?.image_id;
                    updateMember(position, {...members[position], image_id: response.data.id});
                    deleteImageById(previousImageId, () => setBusyPosition(null));
                    onImagesChange();
                },
                onError: (error: any) => {
                    showError(extractImageUploadErrors(error)[0]);
                    setBusyPosition(null);
                },
            }
        );
    };

    const handleRemovePhoto = (position: number) => {
        const {image_id: imageId, ...member} = members[position];
        setBusyPosition(position);
        updateMember(position, member);
        deleteImageById(imageId, () => setBusyPosition(null));
    };

    const handleRemoveMember = (position: number) => {
        deleteImageById(members[position].image_id, () => undefined);
        onChange(members.filter((_, index) => index !== position));
    };

    return (
        <Stack gap="xs">
            <div>
                <Text fw={500} size="sm">{label}</Text>
                <Text size="xs" c="dimmed">{description}</Text>
            </div>

            {members.map((member, position) => {
                const photo = images.find((image) => image.id === member.image_id);

                return (
                    <Group key={position} gap="xs" wrap="nowrap">
                        <Avatar src={photo?.url} size={40} radius="xl">
                            <IconUser size={20}/>
                        </Avatar>
                        <TextInput
                            style={{flex: 1}}
                            aria-label={t`Name`}
                            placeholder={t`Name`}
                            value={member.name}
                            maxLength={100}
                            onChange={(event) => updateMember(position, {...member, name: event.currentTarget.value})}
                        />
                        <ActionIcon
                            variant="light"
                            title={photo ? t`Replace photo` : t`Upload photo`}
                            loading={busyPosition === position}
                            onClick={() => {
                                uploadTargetRef.current = position;
                                fileInputRef.current?.click();
                            }}
                        >
                            <IconPhotoUp size={16}/>
                        </ActionIcon>
                        {photo && (
                            <ActionIcon
                                variant="light"
                                color="orange"
                                title={t`Remove photo`}
                                disabled={busyPosition === position}
                                onClick={() => handleRemovePhoto(position)}
                            >
                                <IconPhotoX size={16}/>
                            </ActionIcon>
                        )}
                        <ActionIcon
                            variant="light"
                            color="red"
                            title={t`Remove person`}
                            onClick={() => handleRemoveMember(position)}
                        >
                            <IconTrash size={16}/>
                        </ActionIcon>
                    </Group>
                );
            })}

            <Button
                variant="subtle"
                size="xs"
                leftSection={<IconPlus size={14}/>}
                disabled={members.length >= maxMembers}
                onClick={() => onChange([...members, {name: ''}])}
                style={{alignSelf: 'flex-start'}}
            >
                {t`Add person`}
            </Button>

            <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{display: 'none'}}
                ref={fileInputRef}
                onChange={(event) => {
                    handleUpload(event.target.files);
                    event.target.value = '';
                }}
            />
        </Stack>
    );
};
