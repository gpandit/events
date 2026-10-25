import {useRef, useState} from "react";
import {t} from "@lingui/macro";
import {ActionIcon, Avatar, Button, Group, Stack, Text, TextInput} from "@mantine/core";
import {IconPhotoUp, IconPhotoX, IconPlus, IconTrash, IconUser} from "@tabler/icons-react";
import {IdParam, Image, TeamMember} from "../../../../../types.ts";
import {useUploadImage} from "../../../../../mutations/useUploadImage.ts";
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

    const membersRef = useRef(members);
    membersRef.current = members;
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    const isBusy = busyPosition !== null;

    const updateMember = (position: number, member: TeamMember) => {
        onChangeRef.current(membersRef.current.map((existing, index) => (index === position ? member : existing)));
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
                    updateMember(position, {...membersRef.current[position], image_id: response.data.id});
                    onImagesChange();
                },
                onError: (error: any) => showError(extractImageUploadErrors(error)[0]),
                onSettled: () => setBusyPosition(null),
            }
        );
    };

    const handleRemovePhoto = (position: number) => {
        const {image_id: _removedImageId, ...member} = membersRef.current[position];
        updateMember(position, member);
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
                            disabled={isBusy}
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
                                disabled={isBusy}
                                onClick={() => handleRemovePhoto(position)}
                            >
                                <IconPhotoX size={16}/>
                            </ActionIcon>
                        )}
                        <ActionIcon
                            variant="light"
                            color="red"
                            title={t`Remove person`}
                            disabled={isBusy}
                            onClick={() => onChange(members.filter((_, index) => index !== position))}
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
                disabled={isBusy || members.length >= maxMembers}
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
