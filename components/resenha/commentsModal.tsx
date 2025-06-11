import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '../Separator';

interface Props {
    visible: boolean;
    postId: string;
    onClose: () => void;
}

const COMMENTS_PER_PAGE = 10;

export const CommentsModal: React.FC<Props> = ({ visible, postId, onClose }) => {
    const theme = useTheme();
    const { user } = useAuth();
    const {
        getPostById,
        posts,
        users,
        getUserById,
        addCommentToPost,
    } = useTimelineStore();

    const post = posts.find((p) => p._id === postId);

    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [visibleComments, setVisibleComments] = useState(COMMENTS_PER_PAGE);

    useEffect(() => {
        if (visible && postId) getPostById(postId);
    }, [visible, postId]);

    useEffect(() => {
        post?.comments.forEach((comment) => {
            if (!users[comment.userId]) {
                getUserById(comment.userId);
            }
        });
    }, [post?.comments]);

    const handleSendComment = async () => {
        if (!newComment.trim() || !user) return;
        setLoading(true);
        const comment = newComment;
        setNewComment('');
        await addCommentToPost(postId, comment, user.id);
        setLoading(false);
    };

    const loadMoreComments = () => {
        setVisibleComments((prev) => prev + COMMENTS_PER_PAGE);
    };

    if (!post) return null;

    return (
        <Modal visible={visible} animationType="slide">
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={80}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={{ flex: 1, backgroundColor: theme.white }}>
                        <View style={styles.header}>
                            <Text style={[styles.title, { color: theme.black }]}>Comentários</Text>
                            <TouchableOpacity onPress={onClose}>
                                <Text style={{ color: theme.greenLight }}>Fechar</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={post.comments.slice(0, visibleComments)}
                            keyExtractor={(_, index) => `comment-${index}`}
                            renderItem={({ item }) => {
                                const author = users[item.userId];
                                return (
                                    <View style={styles.commentRow}>
                                        <Image
                                            source={{
                                                uri:
                                                    author?.profilePhoto ||
                                                    'https://wkflssszfhrwokgtzznz.supabase.co/storage/v1/object/public/avatars/default-avatar.png',
                                            }}
                                            style={styles.avatar}
                                        />
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.name, { color: theme.black }]}>
                                                {author?.name || `Usuário #${item.userId}`}
                                            </Text>
                                            <Text style={{ color: theme.gray }}>{item.content}</Text>
                                        </View>
                                    </View>
                                );
                            }}
                            onEndReached={loadMoreComments}
                            onEndReachedThreshold={0.5}
                            contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
                            keyboardShouldPersistTaps="always"
                        />

                        <Separator />

                        <View style={styles.inputContainer}>
                            <TextInput
                                value={newComment}
                                onChangeText={setNewComment}
                                placeholder="Escreva um comentário..."
                                onSubmitEditing={handleSendComment}
                                returnKeyType="send"
                                submitBehavior="submit"
                                style={[styles.input, { borderColor: theme.gray, color: theme.black }]}
                            />
                            <TouchableOpacity onPress={handleSendComment}>
                                {loading ? (
                                    <ActivityIndicator size="small" color={theme.greenLight} />
                                ) : (
                                    <Text style={{ color: theme.greenLight, fontWeight: 'bold' }}>
                                        Enviar
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Modal>

    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    commentRow: {
        flexDirection: 'row',
        marginBottom: 12,
        gap: 8,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    name: {
        fontWeight: 'bold',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderTopWidth: 1,
        gap: 8,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
});
