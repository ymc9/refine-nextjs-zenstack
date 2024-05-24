'use client';

import { Box, MenuItem, Select, TextField } from '@mui/material';
import { CanAccess } from '@refinedev/core';
import { Create } from '@refinedev/mui';
import { useForm } from '@refinedev/react-hook-form';
import { Controller } from 'react-hook-form';

export default function BlogPostCreate() {
    const {
        saveButtonProps,
        refineCore: { formLoading, onFinish },
        handleSubmit,
        register,
        control,
        formState: { errors },
    } = useForm({});

    return (
        <CanAccess
            resource="post"
            action="create"
            fallback={<div>Not Allowed</div>}
        >
            <Create isLoading={formLoading} saveButtonProps={saveButtonProps}>
                <Box
                    component="form"
                    sx={{ display: 'flex', flexDirection: 'column' }}
                    autoComplete="off"
                >
                    <TextField
                        {...register('title', {
                            required: 'This field is required',
                        })}
                        error={!!(errors as any)?.title}
                        helperText={(errors as any)?.title?.message}
                        margin="normal"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        type="text"
                        label={'Title'}
                        name="title"
                    />
                    <TextField
                        {...register('content', {
                            required: 'This field is required',
                        })}
                        error={!!(errors as any)?.content}
                        helperText={(errors as any)?.content?.message}
                        margin="normal"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        multiline
                        label={'Content'}
                        name="content"
                    />
                    <Controller
                        name="status"
                        control={control}
                        render={({ field }) => {
                            return (
                                <Select
                                    {...field}
                                    value={field?.value || 'draft'}
                                    label={'Status'}
                                >
                                    <MenuItem value="draft">Draft</MenuItem>
                                    <MenuItem value="published">
                                        Published
                                    </MenuItem>
                                    <MenuItem value="rejected">
                                        Rejected
                                    </MenuItem>
                                </Select>
                            );
                        }}
                    />
                </Box>
            </Create>
        </CanAccess>
    );
}
