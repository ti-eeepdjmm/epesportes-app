import React, { useEffect, useState, useRef } from 'react';
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
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '../Separator';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS,
    interpolate,
} from 'react-native-reanimated';
import {
    GestureDetector,
    Gesture,
    GestureHandlerRootView,
} from 'react-native-gesture-handler';

interface Props {
    visible: boolean;
    postId: string;
    onClose: () => void;
}

const COMMENTS_PER_PAGE = 10;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.5;

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

    const translateY = useSharedValue(MODAL_HEIGHT);
    const flatListRef = useRef<FlatList>(null);

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            if (event.translationY > 0) {
                translateY.value = event.translationY;
            }
        })
        .onEnd((event) => {
            if (event.translationY > 100) {
                runOnJS(onClose)();
            } else {
                translateY.value = withSpring(0, { damping: 20 });
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: interpolate(translateY.value, [MODAL_HEIGHT, 0], [0, 1]),
    }));

    useEffect(() => {
        if (visible) {
            translateY.value = MODAL_HEIGHT;
            translateY.value = withSpring(0, { damping: 20 });
        } else {
            translateY.value = withSpring(MODAL_HEIGHT);
        }
    }, [visible]);

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

        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const loadMoreComments = () => {
        setVisibleComments((prev) => prev + COMMENTS_PER_PAGE);
    };

    if (!post) return null;

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <GestureHandlerRootView style={styles.overlay}>
                <GestureDetector gesture={panGesture}>
                    <Animated.View
                        style={[styles.container, animatedStyle, { backgroundColor: theme.white }]}
                    >
                        <View style={styles.handleBar} />
                        <KeyboardAvoidingView
                            style={{ flex: 1 }}
                            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                            keyboardVerticalOffset={80}
                        >
                            <View style={{ flex: 1 }}>
                                <View style={styles.header}>
                                    <Text style={[styles.title, { color: theme.black }]}>Comentários</Text>
                                </View>

                                <FlatList
                                    ref={flatListRef}
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
                                                    <Text style={[styles.name, { color: theme.black }]}> {author?.name || `Usuário #${item.userId}`} </Text>
                                                    <Text style={{ color: theme.gray }}>{item.content}</Text>
                                                </View>
                                            </View>
                                        );
                                    }}
                                    onEndReached={loadMoreComments}
                                    onEndReachedThreshold={0.5}
                                    contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
                                    keyboardShouldPersistTaps="handled"
                                />

                                <Separator />

                                <View style={styles.inputContainer}>
                                    <TextInput
                                        value={newComment}
                                        onChangeText={setNewComment}
                                        placeholder="Escreva um comentário..."
                                        // onSubmitEditing={handleSendComment}
                                        submitBehavior="submit" // <- substitui blurOnSubmit
                                        returnKeyType="send"
                                        multiline={false}
                                        style={[styles.input, { borderColor: theme.gray, color: theme.black }]}
                                    />
                                    <Pressable
                                        onPress={() => {

                                            console.log('Enviando comentário:', newComment);
                                            console.log('Loading state:', loading);
                                            if (!loading && newComment.trim()) {
                                                
                                                Keyboard.dismiss(); // Fecha o teclado
                                                handleSendComment(); // Envia o comentário
                                            }
                                        }}
                                        style={[styles.sendButton, { backgroundColor: theme.greenLight }]}
                                    >
                                        {loading ? (
                                            <ActivityIndicator size="small" color={theme.white} />
                                        ) : (
                                            <Text style={{ color: theme.white, fontWeight: 'bold' }}>Enviar</Text>
                                        )}
                                    </Pressable>
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                    </Animated.View>
                </GestureDetector>
            </GestureHandlerRootView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: '#000000aa',
        justifyContent: 'flex-end',
    },
    container: {
        maxHeight: '90%',
        minHeight: Dimensions.get('window').height * 0.5,
        padding: 16,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        width: '100%',
    },
    handleBar: {
        width: 40,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#ccc',
        alignSelf: 'center',
        marginBottom: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 12,
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
        gap: 8,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    sendButton: {
        padding: 8,
        paddingHorizontal: 16,
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
