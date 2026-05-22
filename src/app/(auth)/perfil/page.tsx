"use client";

import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { 
    User, 
    Mail, 
    Phone, 
    FileText, 
    Camera, 
    Loader2, 
    Save,
    ShieldCheck,
    KeyRound,
    X,
    Trash2
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { maskPhone, maskCPF, unmask } from "@/lib/masks";
import { useUserProfile, useUserMutations } from "@/hooks/useUserProfile";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { toast } from "sonner";

type PerfilFormData = {
    nome: string;
    email: string;
    telefone: string;
    cpf: string;
};

export default function PerfilPage() {
    const { data: session } = useSession();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDeletePhotoOpen, setIsDeletePhotoOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    
    const { data: userData, isLoading } = useUserProfile(session?.user?.id);
    const { updateUser, uploadFoto, deleteFoto, isSaving, isUploading, isDeleting } = useUserMutations(session?.user?.id);

    const { register, handleSubmit, reset, setValue, watch } = useForm<PerfilFormData>();
    const phoneValue = watch("telefone") || "";
    const cpfValue = watch("cpf") || "";

    useEffect(() => {
        if (userData) {
            reset({
                nome: userData.nome,
                email: userData.email,
                telefone: maskPhone(userData.telefone || ""),
                cpf: maskCPF(userData.cpf || ""),
            });
        }
    }, [userData, reset]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) uploadFoto(file);
    };

    if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-green" /></div>;

    const onSubmit = (d: PerfilFormData) => {
        const payload = {
            ...d,
            telefone: unmask(d.telefone),
            cpf: unmask(d.cpf)
        };
        updateUser(payload);
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-20 animate-fade-in text-text-primary">
            <header>
                <h1 className="text-3xl font-bold text-text-primary">Meu Perfil</h1>
                <p className="text-text-secondary">Gerencie suas informações pessoais e segurança</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Lado Esquerdo: Foto e Status */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-surface-white rounded-3xl shadow-sm border border-border-gray p-6 text-center">
                        <div className="relative w-32 h-32 mx-auto mb-6">
                            <div className="relative w-full h-full rounded-full bg-surface-light border-2 border-primary-green/20 flex items-center justify-center overflow-hidden">
                                {userData?.foto_perfil ? (
                                    <Image 
                                        src={userData.foto_perfil} 
                                        alt="Perfil" 
                                        fill 
                                        unoptimized
                                        className="object-cover" 
                                    />
                                ) : (
                                    <User className="w-12 h-12 text-text-tertiary opacity-30" />
                                )}
                                {isUploading && (
                                    <div className="absolute inset-0 bg-surface-white/60 flex items-center justify-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary-green" />
                                    </div>
                                )}
                            </div>
                            <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 p-2 bg-primary-navy text-white rounded-full shadow-lg hover:scale-105 transition-all z-10 border-2 border-white"
                                title="Alterar foto"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                            {userData?.foto_perfil && (
                                <button 
                                    type="button"
                                    onClick={() => setIsDeletePhotoOpen(true)}
                                    disabled={isDeleting}
                                    className="absolute top-0 right-0 p-1.5 bg-error-button text-white rounded-full shadow-lg hover:scale-105 transition-all z-10 border-2 border-white"
                                    title="Remover foto"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
                        </div>
                        
                        <h3 className="font-bold text-text-primary truncate">{userData?.nome}</h3>
                        <p className="text-xs text-text-secondary mb-4">{userData?.email}</p>

                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-success-bg rounded-full border border-success-text/10">
                            <ShieldCheck className="w-3 h-3 text-primary-green" />
                            <span className="text-[10px] font-black uppercase text-primary-green tracking-wider">Conta Verificada</span>
                        </div>
                    </div>

                    <div className="bg-primary-navy rounded-3xl p-6 text-white space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <KeyRound className="w-4 h-4 text-primary-green" />
                            </div>
                            <span className="text-sm font-bold">Segurança</span>
                        </div>
                        <p className="text-[11px] text-gray-400 font-medium">Deseja alterar sua senha? Enviaremos um link de redefinição seguro para seu e-mail.</p>
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            className="w-full font-bold h-10 rounded-xl"
                            onClick={() => setIsPasswordModalOpen(true)}
                        >
                            Alterar Senha
                        </Button>
                    </div>
                </div>

                {/* Lado Direito: Formulário */}
                <div className="md:col-span-2 space-y-6">
                    <section className="bg-surface-white p-8 rounded-3xl shadow-sm border border-border-gray">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            
                            <div className="space-y-4">
                                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-4">
                                    <FileText className="w-4 h-4 text-primary-green" /> Informações Pessoais
                                </h2>
                                
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-text-tertiary uppercase">Nome Completo</Label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                                        <Input 
                                            {...register("nome")} 
                                            className="pl-11 bg-surface-light border border-border-gray h-12 text-text-primary font-medium focus-visible:ring-primary-green transition-all" 
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-text-tertiary uppercase">E-mail</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                                            <Input 
                                                {...register("email")} 
                                                disabled
                                                className="pl-11 bg-surface-light border border-border-gray h-12 text-text-tertiary cursor-not-allowed opacity-60" 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-text-tertiary uppercase">CPF</Label>
                                        <div className="relative">
                                            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                                            <Input 
                                                {...register("cpf")} 
                                                value={cpfValue}
                                                onChange={(e) => setValue("cpf", maskCPF(e.target.value))}
                                                placeholder="000.000.000-00"
                                                className="pl-11 bg-surface-light border border-border-gray h-12 text-text-primary font-medium focus-visible:ring-primary-green transition-all" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-text-tertiary uppercase">Telefone / WhatsApp</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                                        <Input 
                                            {...register("telefone")} 
                                            value={phoneValue}
                                            onChange={(e) => setValue("telefone", maskPhone(e.target.value))}
                                            placeholder="(00) 00000-0000"
                                            className="pl-11 bg-surface-light border border-border-gray h-12 text-text-primary font-medium focus-visible:ring-primary-green transition-all" 
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button type="submit" disabled={isSaving} className="w-full sm:w-auto px-8 h-12 rounded-2xl font-black shadow-xl shadow-primary-green/20">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                SALVAR ALTERAÇÕES
                            </Button>
                        </form>
                    </section>
                </div>
            </div>

            <Dialog open={isDeletePhotoOpen} onOpenChange={setIsDeletePhotoOpen}>
                <DialogContent className="sm:max-w-[400px] bg-surface-white border-border-gray shadow-xl rounded-[2rem] p-8">
                    <DialogHeader>
                        <DialogTitle className="text-error-text flex items-center gap-2 font-black text-xl">
                            <Trash2 className="w-5 h-5" />
                            Remover Foto
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-text-secondary font-medium">
                            Tem certeza que deseja excluir sua foto de perfil? Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-3 mt-6">
                        <Button variant="outline" className="rounded-xl font-bold flex-1" onClick={() => setIsDeletePhotoOpen(false)}>Cancelar</Button>
                        <Button 
                            variant="destructive" 
                            className="rounded-xl font-bold flex-1" 
                            disabled={isDeleting}
                            onClick={() => {
                                deleteFoto();
                                setIsDeletePhotoOpen(false);
                            }}
                        >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar Exclusão"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de Confirmação de Alteração de Senha */}
            <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                <DialogContent className="sm:max-w-[400px] bg-surface-white border-border-gray shadow-xl rounded-[2rem] p-8">
                    <DialogHeader>
                        <DialogTitle className="text-text-primary flex items-center gap-3 font-black text-xl">
                            <div className="w-10 h-10 rounded-xl bg-primary-green/10 flex items-center justify-center">
                                <KeyRound className="w-6 h-6 text-primary-green" />
                            </div>
                            Redefinir Senha
                        </DialogTitle>
                        <DialogDescription className="pt-4 text-text-secondary font-medium text-sm leading-relaxed">
                            Para sua segurança, enviaremos um link de redefinição de senha para:
                            <br />
                            <strong className="text-text-primary block mt-2 text-base font-black">{userData?.email}</strong>
                            <br />
                            Você poderá criar uma nova senha através deste link de forma segura. Deseja continuar?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-3 mt-8">
                        <Button variant="ghost" className="rounded-xl font-bold flex-1 h-12 text-text-tertiary" onClick={() => setIsPasswordModalOpen(false)}>CANCELAR</Button>
                        <Button 
                            className="rounded-xl font-black flex-1 h-12 bg-primary-green hover:bg-primary-green/90 text-white shadow-lg shadow-primary-green/20" 
                            onClick={() => {
                                toast.success("Link de redefinição enviado para " + userData?.email);
                                setIsPasswordModalOpen(false);
                            }}
                        >
                            ENVIAR LINK
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
