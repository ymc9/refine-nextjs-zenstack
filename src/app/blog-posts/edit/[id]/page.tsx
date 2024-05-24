'use client';

import { Box, Select, TextField } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import { Edit } from '@refinedev/mui';
import { useForm } from '@refinedev/react-hook-form';
import { Controller } from 'react-hook-form';

export default function BlogPostEdit() {
    const {
        saveButtonProps,
        refineCore: { queryResult, formLoading, onFinish },
        handleSubmit,
        register,
        control,
        formState: { errors },
    } = useForm({});

    return (
        <Edit isLoading={formLoading} saveButtonProps={saveButtonProps}>
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
                                <MenuItem value="published">Published</MenuItem>
                                <MenuItem value="rejected">Rejected</MenuItem>
                            </Select>
                        );
                    }}
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
                    rows={4}
                />
            </Box>
        </Edit>
    );
}
